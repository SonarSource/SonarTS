/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, ChangeDetectionStrategy, Component, ComponentFactory, Directive, Host, Inject, Injectable, InjectionToken, ModuleWithProviders, Optional, Provider, Query, RendererType2, SchemaMetadata, Self, SkipSelf, Type, resolveForwardRef, ɵConsole as Console, ɵERROR_COMPONENT_TYPE, ɵLIFECYCLE_HOOKS_VALUES, ɵReflectorReader, ɵccf as createComponentFactory, ɵreflector, ɵstringify as stringify} from '@angular/core';

import {StaticSymbol, StaticSymbolCache} from './aot/static_symbol';
import {ngfactoryFilePath} from './aot/util';
import {assertArrayOfStrings, assertInterpolationSymbols} from './assertions';
import * as cpl from './compile_metadata';
import {CompilerConfig} from './config';
import {DirectiveNormalizer} from './directive_normalizer';
import {DirectiveResolver} from './directive_resolver';
import {Identifiers, resolveIdentifier} from './identifiers';
import {CompilerInjectable} from './injectable';
import {hasLifecycleHook} from './lifecycle_reflector';
import {NgModuleResolver} from './ng_module_resolver';
import {PipeResolver} from './pipe_resolver';
import {ElementSchemaRegistry} from './schema/element_schema_registry';
import {SummaryResolver} from './summary_resolver';
import {getUrlScheme} from './url_resolver';
import {MODULE_SUFFIX, ValueTransformer, noUndefined, syntaxError, visitValue} from './util';

export type ErrorCollector = (error: any, type?: any) => void;
export const ERROR_COLLECTOR_TOKEN = new InjectionToken('ErrorCollector');

// Design notes:
// - don't lazily create metadata:
//   For some metadata, we need to do async work sometimes,
//   so the user has to kick off this loading.
//   But we want to report errors even when the async work is
//   not required to check that the user would have been able
//   to wait correctly.
@CompilerInjectable()
export class CompileMetadataResolver {
  private _nonNormalizedDirectiveCache =
      new Map<Type<any>, {annotation: Directive, metadata: cpl.CompileDirectiveMetadata}>();
  private _directiveCache = new Map<Type<any>, cpl.CompileDirectiveMetadata>();
  private _summaryCache = new Map<Type<any>, cpl.CompileTypeSummary|null>();
  private _pipeCache = new Map<Type<any>, cpl.CompilePipeMetadata>();
  private _ngModuleCache = new Map<Type<any>, cpl.CompileNgModuleMetadata>();
  private _ngModuleOfTypes = new Map<Type<any>, Type<any>>();

  constructor(
      private _config: CompilerConfig, private _ngModuleResolver: NgModuleResolver,
      private _directiveResolver: DirectiveResolver, private _pipeResolver: PipeResolver,
      private _summaryResolver: SummaryResolver<any>,
      private _schemaRegistry: ElementSchemaRegistry,
      private _directiveNormalizer: DirectiveNormalizer, private _console: Console,
      @Optional() private _staticSymbolCache: StaticSymbolCache,
      private _reflector: ɵReflectorReader = ɵreflector,
      @Optional() @Inject(ERROR_COLLECTOR_TOKEN) private _errorCollector?: ErrorCollector) {}

  clearCacheFor(type: Type<any>) {
    const dirMeta = this._directiveCache.get(type);
    this._directiveCache.delete(type);
    this._nonNormalizedDirectiveCache.delete(type);
    this._summaryCache.delete(type);
    this._pipeCache.delete(type);
    this._ngModuleOfTypes.delete(type);
    // Clear all of the NgModule as they contain transitive information!
    this._ngModuleCache.clear();
    if (dirMeta) {
      this._directiveNormalizer.clearCacheFor(dirMeta);
    }
  }

  clearCache(): void {
    this._directiveCache.clear();
    this._nonNormalizedDirectiveCache.clear();
    this._summaryCache.clear();
    this._pipeCache.clear();
    this._ngModuleCache.clear();
    this._ngModuleOfTypes.clear();
    this._directiveNormalizer.clearCache();
  }

  private _createProxyClass(baseType: any, name: string): cpl.ProxyClass {
    let delegate: any = null;
    const proxyClass: cpl.ProxyClass = <any>function() {
      if (!delegate) {
        throw new Error(
            `Illegal state: Class ${name} for type ${stringify(baseType)} is not compiled yet!`);
      }
      return delegate.apply(this, arguments);
    };
    proxyClass.setDelegate = (d) => {
      delegate = d;
      (<any>proxyClass).prototype = d.prototype;
    };
    // Make stringify work correctly
    (<any>proxyClass).overriddenName = name;
    return proxyClass;
  }

  private getGeneratedClass(dirType: any, name: string): StaticSymbol|cpl.ProxyClass {
    if (dirType instanceof StaticSymbol) {
      return this._staticSymbolCache.get(ngfactoryFilePath(dirType.filePath), name);
    } else {
      return this._createProxyClass(dirType, name);
    }
  }

  private getComponentViewClass(dirType: any): StaticSymbol|cpl.ProxyClass {
    return this.getGeneratedClass(dirType, cpl.viewClassName(dirType, 0));
  }

  getHostComponentViewClass(dirType: any): StaticSymbol|cpl.ProxyClass {
    return this.getGeneratedClass(dirType, cpl.hostViewClassName(dirType));
  }

  getHostComponentType(dirType: any): StaticSymbol|Type<any> {
    const name = `${cpl.identifierName({reference: dirType})}_Host`;
    if (dirType instanceof StaticSymbol) {
      return this._staticSymbolCache.get(dirType.filePath, name);
    } else {
      const HostClass = <any>function HostClass() {};
      HostClass.overriddenName = name;

      return HostClass;
    }
  }

  private getRendererType(dirType: any): StaticSymbol|RendererType2 {
    if (dirType instanceof StaticSymbol) {
      return this._staticSymbolCache.get(
          ngfactoryFilePath(dirType.filePath), cpl.rendererTypeName(dirType));
    } else {
      // returning an object as proxy,
      // that we fill later during runtime compilation.
      return <any>{};
    }
  }

  private getComponentFactory(
      selector: string, dirType: any, inputs: {[key: string]: string}|null,
      outputs: {[key: string]: string}): StaticSymbol|ComponentFactory<any> {
    if (dirType instanceof StaticSymbol) {
      return this._staticSymbolCache.get(
          ngfactoryFilePath(dirType.filePath), cpl.componentFactoryName(dirType));
    } else {
      const hostView = this.getHostComponentViewClass(dirType);
      // Note: ngContentSelectors will be filled later once the template is
      // loaded.
      return createComponentFactory(selector, dirType, <any>hostView, inputs, outputs, []);
    }
  }

  private initComponentFactory(
      factory: StaticSymbol|ComponentFactory<any>, ngContentSelectors: string[]) {
    if (!(factory instanceof StaticSymbol)) {
      factory.ngContentSelectors.push(...ngContentSelectors);
    }
  }

  private _loadSummary(type: any, kind: cpl.CompileSummaryKind): cpl.CompileTypeSummary|null {
    let typeSummary = this._summaryCache.get(type);
    if (!typeSummary) {
      const summary = this._summaryResolver.resolveSummary(type);
      typeSummary = summary ? summary.type : null;
      this._summaryCache.set(type, typeSummary || null);
    }
    return typeSummary && typeSummary.summaryKind === kind ? typeSummary : null;
  }

  loadDirectiveMetadata(ngModuleType: any, directiveType: any, isSync: boolean): Promise<any>|null {
    if (this._directiveCache.has(directiveType)) {
      return null;
    }
    directiveType = resolveForwardRef(directiveType);
    const {annotation, metadata} = this.getNonNormalizedDirectiveMetadata(directiveType) !;

    const createDirectiveMetadata = (templateMetadata: cpl.CompileTemplateMetadata | null) => {
      const normalizedDirMeta = new cpl.CompileDirectiveMetadata({
        isHost: false,
        type: metadata.type,
        isComponent: metadata.isComponent,
        selector: metadata.selector,
        exportAs: metadata.exportAs,
        changeDetection: metadata.changeDetection,
        inputs: metadata.inputs,
        outputs: metadata.outputs,
        hostListeners: metadata.hostListeners,
        hostProperties: metadata.hostProperties,
        hostAttributes: metadata.hostAttributes,
        providers: metadata.providers,
        viewProviders: metadata.viewProviders,
        queries: metadata.queries,
        viewQueries: metadata.viewQueries,
        entryComponents: metadata.entryComponents,
        componentViewType: metadata.componentViewType,
        rendererType: metadata.rendererType,
        componentFactory: metadata.componentFactory,
        template: templateMetadata
      });
      if (templateMetadata) {
        this.initComponentFactory(metadata.componentFactory !, templateMetadata.ngContentSelectors);
      }
      this._directiveCache.set(directiveType, normalizedDirMeta);
      this._summaryCache.set(directiveType, normalizedDirMeta.toSummary());
      return normalizedDirMeta;
    };

    if (metadata.isComponent) {
      const template = metadata.template !;
      const templateMeta = this._directiveNormalizer.normalizeTemplate({
        ngModuleType,
        componentType: directiveType,
        moduleUrl: componentModuleUrl(this._reflector, directiveType, annotation),
        encapsulation: template.encapsulation,
        template: template.template,
        templateUrl: template.templateUrl,
        styles: template.styles,
        styleUrls: template.styleUrls,
        animations: template.animations,
        interpolation: template.interpolation
      });
      if (templateMeta.syncResult) {
        createDirectiveMetadata(templateMeta.syncResult);
        return null;
      } else {
        if (isSync) {
          this._reportError(componentStillLoadingError(directiveType), directiveType);
          return null;
        }
        return templateMeta.asyncResult !.then(createDirectiveMetadata);
      }
    } else {
      // directive
      createDirectiveMetadata(null);
      return null;
    }
  }

  getNonNormalizedDirectiveMetadata(directiveType: any):
      {annotation: Directive, metadata: cpl.CompileDirectiveMetadata}|null {
    directiveType = resolveForwardRef(directiveType);
    if (!directiveType) {
      return null;
    }
    let cacheEntry = this._nonNormalizedDirectiveCache.get(directiveType);
    if (cacheEntry) {
      return cacheEntry;
    }
    const dirMeta = this._directiveResolver.resolve(directiveType, false);
    if (!dirMeta) {
      return null;
    }
    let nonNormalizedTemplateMetadata: cpl.CompileTemplateMetadata = undefined !;

    if (dirMeta instanceof Component) {
      // component
      assertArrayOfStrings('styles', dirMeta.styles);
      assertArrayOfStrings('styleUrls', dirMeta.styleUrls);
      assertInterpolationSymbols('interpolation', dirMeta.interpolation);

      const animations = dirMeta.animations;

      nonNormalizedTemplateMetadata = new cpl.CompileTemplateMetadata({
        encapsulation: noUndefined(dirMeta.encapsulation),
        template: noUndefined(dirMeta.template),
        templateUrl: noUndefined(dirMeta.templateUrl),
        styles: dirMeta.styles || [],
        styleUrls: dirMeta.styleUrls || [],
        animations: animations || [],
        interpolation: noUndefined(dirMeta.interpolation),
        isInline: !!dirMeta.template,
        externalStylesheets: [],
        ngContentSelectors: []
      });
    }

    let changeDetectionStrategy: ChangeDetectionStrategy = null !;
    let viewProviders: cpl.CompileProviderMetadata[] = [];
    let entryComponentMetadata: cpl.CompileEntryComponentMetadata[] = [];
    let selector = dirMeta.selector;

    if (dirMeta instanceof Component) {
      // Component
      changeDetectionStrategy = dirMeta.changeDetection !;
      if (dirMeta.viewProviders) {
        viewProviders = this._getProvidersMetadata(
            dirMeta.viewProviders, entryComponentMetadata,
            `viewProviders for "${stringifyType(directiveType)}"`, [], directiveType);
      }
      if (dirMeta.entryComponents) {
        entryComponentMetadata = flattenAndDedupeArray(dirMeta.entryComponents)
                                     .map((type) => this._getEntryComponentMetadata(type) !)
                                     .concat(entryComponentMetadata);
      }
      if (!selector) {
        selector = this._schemaRegistry.getDefaultComponentElementName();
      }
    } else {
      // Directive
      if (!selector) {
        this._reportError(
            syntaxError(
                `Directive ${stringifyType(directiveType)} has no selector, please add it!`),
            directiveType);
        selector = 'error';
      }
    }

    let providers: cpl.CompileProviderMetadata[] = [];
    if (dirMeta.providers != null) {
      providers = this._getProvidersMetadata(
          dirMeta.providers, entryComponentMetadata,
          `providers for "${stringifyType(directiveType)}"`, [], directiveType);
    }
    let queries: cpl.CompileQueryMetadata[] = [];
    let viewQueries: cpl.CompileQueryMetadata[] = [];
    if (dirMeta.queries != null) {
      queries = this._getQueriesMetadata(dirMeta.queries, false, directiveType);
      viewQueries = this._getQueriesMetadata(dirMeta.queries, true, directiveType);
    }

    const metadata = cpl.CompileDirectiveMetadata.create({
      isHost: false,
      selector: selector,
      exportAs: noUndefined(dirMeta.exportAs),
      isComponent: !!nonNormalizedTemplateMetadata,
      type: this._getTypeMetadata(directiveType),
      template: nonNormalizedTemplateMetadata,
      changeDetection: changeDetectionStrategy,
      inputs: dirMeta.inputs || [],
      outputs: dirMeta.outputs || [],
      host: dirMeta.host || {},
      providers: providers || [],
      viewProviders: viewProviders || [],
      queries: queries || [],
      viewQueries: viewQueries || [],
      entryComponents: entryComponentMetadata,
      componentViewType: nonNormalizedTemplateMetadata ? this.getComponentViewClass(directiveType) :
                                                         null,
      rendererType: nonNormalizedTemplateMetadata ? this.getRendererType(directiveType) : null,
      componentFactory: null
    });
    if (nonNormalizedTemplateMetadata) {
      metadata.componentFactory =
          this.getComponentFactory(selector, directiveType, metadata.inputs, metadata.outputs);
    }
    cacheEntry = {metadata, annotation: dirMeta};
    this._nonNormalizedDirectiveCache.set(directiveType, cacheEntry);
    return cacheEntry;
  }

  /**
   * Gets the metadata for the given directive.
   * This assumes `loadNgModuleDirectiveAndPipeMetadata` has been called first.
   */
  getDirectiveMetadata(directiveType: any): cpl.CompileDirectiveMetadata {
    const dirMeta = this._directiveCache.get(directiveType) !;
    if (!dirMeta) {
      this._reportError(
          syntaxError(
              `Illegal state: getDirectiveMetadata can only be called after loadNgModuleDirectiveAndPipeMetadata for a module that declares it. Directive ${stringifyType(directiveType)}.`),
          directiveType);
    }
    return dirMeta;
  }

  getDirectiveSummary(dirType: any): cpl.CompileDirectiveSummary {
    const dirSummary =
        <cpl.CompileDirectiveSummary>this._loadSummary(dirType, cpl.CompileSummaryKind.Directive);
    if (!dirSummary) {
      this._reportError(
          syntaxError(
              `Illegal state: Could not load the summary for directive ${stringifyType(dirType)}.`),
          dirType);
    }
    return dirSummary;
  }

  isDirective(type: any) {
    return !!this._loadSummary(type, cpl.CompileSummaryKind.Directive) ||
        this._directiveResolver.isDirective(type);
  }

  isPipe(type: any) {
    return !!this._loadSummary(type, cpl.CompileSummaryKind.Pipe) ||
        this._pipeResolver.isPipe(type);
  }

  isNgModule(type: any) {
    return !!this._loadSummary(type, cpl.CompileSummaryKind.NgModule) ||
        this._ngModuleResolver.isNgModule(type);
  }

  getNgModuleSummary(moduleType: any): cpl.CompileNgModuleSummary|null {
    let moduleSummary: cpl.CompileNgModuleSummary|null =
        <cpl.CompileNgModuleSummary>this._loadSummary(moduleType, cpl.CompileSummaryKind.NgModule);
    if (!moduleSummary) {
      const moduleMeta = this.getNgModuleMetadata(moduleType, false);
      moduleSummary = moduleMeta ? moduleMeta.toSummary() : null;
      if (moduleSummary) {
        this._summaryCache.set(moduleType, moduleSummary);
      }
    }
    return moduleSummary;
  }

  /**
   * Loads the declared directives and pipes of an NgModule.
   */
  loadNgModuleDirectiveAndPipeMetadata(moduleType: any, isSync: boolean, throwIfNotFound = true):
      Promise<any> {
    const ngModule = this.getNgModuleMetadata(moduleType, throwIfNotFound);
    const loading: Promise<any>[] = [];
    if (ngModule) {
      ngModule.declaredDirectives.forEach((id) => {
        const promise = this.loadDirectiveMetadata(moduleType, id.reference, isSync);
        if (promise) {
          loading.push(promise);
        }
      });
      ngModule.declaredPipes.forEach((id) => this._loadPipeMetadata(id.reference));
    }
    return Promise.all(loading);
  }

  getNgModuleMetadata(moduleType: any, throwIfNotFound = true): cpl.CompileNgModuleMetadata|null {
    moduleType = resolveForwardRef(moduleType);
    let compileMeta = this._ngModuleCache.get(moduleType);
    if (compileMeta) {
      return compileMeta;
    }
    const meta = this._ngModuleResolver.resolve(moduleType, throwIfNotFound);
    if (!meta) {
      return null;
    }
    const declaredDirectives: cpl.CompileIdentifierMetadata[] = [];
    const exportedNonModuleIdentifiers: cpl.CompileIdentifierMetadata[] = [];
    const declaredPipes: cpl.CompileIdentifierMetadata[] = [];
    const importedModules: cpl.CompileNgModuleSummary[] = [];
    const exportedModules: cpl.CompileNgModuleSummary[] = [];
    const providers: cpl.CompileProviderMetadata[] = [];
    const entryComponents: cpl.CompileEntryComponentMetadata[] = [];
    const bootstrapComponents: cpl.CompileIdentifierMetadata[] = [];
    const schemas: SchemaMetadata[] = [];

    if (meta.imports) {
      flattenAndDedupeArray(meta.imports).forEach((importedType) => {
        let importedModuleType: Type<any> = undefined !;
        if (isValidType(importedType)) {
          importedModuleType = importedType;
        } else if (importedType && importedType.ngModule) {
          const moduleWithProviders: ModuleWithProviders = importedType;
          importedModuleType = moduleWithProviders.ngModule;
          if (moduleWithProviders.providers) {
            providers.push(...this._getProvidersMetadata(
                moduleWithProviders.providers, entryComponents,
                `provider for the NgModule '${stringifyType(importedModuleType)}'`, [],
                importedType));
          }
        }

        if (importedModuleType) {
          if (this._checkSelfImport(moduleType, importedModuleType)) return;
          const importedModuleSummary = this.getNgModuleSummary(importedModuleType);
          if (!importedModuleSummary) {
            this._reportError(
                syntaxError(
                    `Unexpected ${this._getTypeDescriptor(importedType)} '${stringifyType(importedType)}' imported by the module '${stringifyType(moduleType)}'. Please add a @NgModule annotation.`),
                moduleType);
            return;
          }
          importedModules.push(importedModuleSummary);
        } else {
          this._reportError(
              syntaxError(
                  `Unexpected value '${stringifyType(importedType)}' imported by the module '${stringifyType(moduleType)}'`),
              moduleType);
          return;
        }
      });
    }

    if (meta.exports) {
      flattenAndDedupeArray(meta.exports).forEach((exportedType) => {
        if (!isValidType(exportedType)) {
          this._reportError(
              syntaxError(
                  `Unexpected value '${stringifyType(exportedType)}' exported by the module '${stringifyType(moduleType)}'`),
              moduleType);
          return;
        }
        const exportedModuleSummary = this.getNgModuleSummary(exportedType);
        if (exportedModuleSummary) {
          exportedModules.push(exportedModuleSummary);
        } else {
          exportedNonModuleIdentifiers.push(this._getIdentifierMetadata(exportedType));
        }
      });
    }

    // Note: This will be modified later, so we rely on
    // getting a new instance every time!
    const transitiveModule = this._getTransitiveNgModuleMetadata(importedModules, exportedModules);
    if (meta.declarations) {
      flattenAndDedupeArray(meta.declarations).forEach((declaredType) => {
        if (!isValidType(declaredType)) {
          this._reportError(
              syntaxError(
                  `Unexpected value '${stringifyType(declaredType)}' declared by the module '${stringifyType(moduleType)}'`),
              moduleType);
          return;
        }
        const declaredIdentifier = this._getIdentifierMetadata(declaredType);
        if (this.isDirective(declaredType)) {
          transitiveModule.addDirective(declaredIdentifier);
          declaredDirectives.push(declaredIdentifier);
          this._addTypeToModule(declaredType, moduleType);
        } else if (this.isPipe(declaredType)) {
          transitiveModule.addPipe(declaredIdentifier);
          transitiveModule.pipes.push(declaredIdentifier);
          declaredPipes.push(declaredIdentifier);
          this._addTypeToModule(declaredType, moduleType);
        } else {
          this._reportError(
              syntaxError(
                  `Unexpected ${this._getTypeDescriptor(declaredType)} '${stringifyType(declaredType)}' declared by the module '${stringifyType(moduleType)}'. Please add a @Pipe/@Directive/@Component annotation.`),
              moduleType);
          return;
        }
      });
    }

    const exportedDirectives: cpl.CompileIdentifierMetadata[] = [];
    const exportedPipes: cpl.CompileIdentifierMetadata[] = [];
    exportedNonModuleIdentifiers.forEach((exportedId) => {
      if (transitiveModule.directivesSet.has(exportedId.reference)) {
        exportedDirectives.push(exportedId);
        transitiveModule.addExportedDirective(exportedId);
      } else if (transitiveModule.pipesSet.has(exportedId.reference)) {
        exportedPipes.push(exportedId);
        transitiveModule.addExportedPipe(exportedId);
      } else {
        this._reportError(
            syntaxError(
                `Can't export ${this._getTypeDescriptor(exportedId.reference)} ${stringifyType(exportedId.reference)} from ${stringifyType(moduleType)} as it was neither declared nor imported!`),
            moduleType);
        return;
      }
    });

    // The providers of the module have to go last
    // so that they overwrite any other provider we already added.
    if (meta.providers) {
      providers.push(...this._getProvidersMetadata(
          meta.providers, entryComponents,
          `provider for the NgModule '${stringifyType(moduleType)}'`, [], moduleType));
    }

    if (meta.entryComponents) {
      entryComponents.push(...flattenAndDedupeArray(meta.entryComponents)
                               .map(type => this._getEntryComponentMetadata(type) !));
    }

    if (meta.bootstrap) {
      flattenAndDedupeArray(meta.bootstrap).forEach(type => {
        if (!isValidType(type)) {
          this._reportError(
              syntaxError(
                  `Unexpected value '${stringifyType(type)}' used in the bootstrap property of module '${stringifyType(moduleType)}'`),
              moduleType);
          return;
        }
        bootstrapComponents.push(this._getIdentifierMetadata(type));
      });
    }

    entryComponents.push(
        ...bootstrapComponents.map(type => this._getEntryComponentMetadata(type.reference) !));

    if (meta.schemas) {
      schemas.push(...flattenAndDedupeArray(meta.schemas));
    }

    compileMeta = new cpl.CompileNgModuleMetadata({
      type: this._getTypeMetadata(moduleType),
      providers,
      entryComponents,
      bootstrapComponents,
      schemas,
      declaredDirectives,
      exportedDirectives,
      declaredPipes,
      exportedPipes,
      importedModules,
      exportedModules,
      transitiveModule,
      id: meta.id || null,
    });

    entryComponents.forEach((id) => transitiveModule.addEntryComponent(id));
    providers.forEach((provider) => transitiveModule.addProvider(provider, compileMeta !.type));
    transitiveModule.addModule(compileMeta.type);
    this._ngModuleCache.set(moduleType, compileMeta);
    return compileMeta;
  }

  private _checkSelfImport(moduleType: Type<any>, importedModuleType: Type<any>): boolean {
    if (moduleType === importedModuleType) {
      this._reportError(
          syntaxError(`'${stringifyType(moduleType)}' module can't import itself`), moduleType);
      return true;
    }
    return false;
  }

  private _getTypeDescriptor(type: Type<any>): string {
    if (this.isDirective(type)) {
      return 'directive';
    }

    if (this.isPipe(type)) {
      return 'pipe';
    }

    if (this.isNgModule(type)) {
      return 'module';
    }

    if ((type as any).provide) {
      return 'provider';
    }

    return 'value';
  }


  private _addTypeToModule(type: Type<any>, moduleType: Type<any>) {
    const oldModule = this._ngModuleOfTypes.get(type);
    if (oldModule && oldModule !== moduleType) {
      this._reportError(
          syntaxError(
              `Type ${stringifyType(type)} is part of the declarations of 2 modules: ${stringifyType(oldModule)} and ${stringifyType(moduleType)}! ` +
              `Please consider moving ${stringifyType(type)} to a higher module that imports ${stringifyType(oldModule)} and ${stringifyType(moduleType)}. ` +
              `You can also create a new NgModule that exports and includes ${stringifyType(type)} then import that NgModule in ${stringifyType(oldModule)} and ${stringifyType(moduleType)}.`),
          moduleType);
      return;
    }
    this._ngModuleOfTypes.set(type, moduleType);
  }

  private _getTransitiveNgModuleMetadata(
      importedModules: cpl.CompileNgModuleSummary[],
      exportedModules: cpl.CompileNgModuleSummary[]): cpl.TransitiveCompileNgModuleMetadata {
    // collect `providers` / `entryComponents` from all imported and all exported modules
    const result = new cpl.TransitiveCompileNgModuleMetadata();
    const modulesByToken = new Map<any, Set<any>>();
    importedModules.concat(exportedModules).forEach((modSummary) => {
      modSummary.modules.forEach((mod) => result.addModule(mod));
      modSummary.entryComponents.forEach((comp) => result.addEntryComponent(comp));
      const addedTokens = new Set<any>();
      modSummary.providers.forEach((entry) => {
        const tokenRef = cpl.tokenReference(entry.provider.token);
        let prevModules = modulesByToken.get(tokenRef);
        if (!prevModules) {
          prevModules = new Set<any>();
          modulesByToken.set(tokenRef, prevModules);
        }
        const moduleRef = entry.module.reference;
        // Note: the providers of one module may still contain multiple providers
        // per token (e.g. for multi providers), and we need to preserve these.
        if (addedTokens.has(tokenRef) || !prevModules.has(moduleRef)) {
          prevModules.add(moduleRef);
          addedTokens.add(tokenRef);
          result.addProvider(entry.provider, entry.module);
        }
      });
    });
    exportedModules.forEach((modSummary) => {
      modSummary.exportedDirectives.forEach((id) => result.addExportedDirective(id));
      modSummary.exportedPipes.forEach((id) => result.addExportedPipe(id));
    });
    importedModules.forEach((modSummary) => {
      modSummary.exportedDirectives.forEach((id) => result.addDirective(id));
      modSummary.exportedPipes.forEach((id) => result.addPipe(id));
    });
    return result;
  }

  private _getIdentifierMetadata(type: Type<any>): cpl.CompileIdentifierMetadata {
    type = resolveForwardRef(type);
    return {reference: type};
  }

  isInjectable(type: any): boolean {
    const annotations = this._reflector.annotations(type);
    // Note: We need an exact check here as @Component / @Directive / ... inherit
    // from @CompilerInjectable!
    return annotations.some(ann => ann.constructor === Injectable);
  }

  getInjectableSummary(type: any): cpl.CompileTypeSummary {
    return {
      summaryKind: cpl.CompileSummaryKind.Injectable,
      type: this._getTypeMetadata(type, null, false)
    };
  }

  private _getInjectableMetadata(type: Type<any>, dependencies: any[]|null = null):
      cpl.CompileTypeMetadata {
    const typeSummary = this._loadSummary(type, cpl.CompileSummaryKind.Injectable);
    if (typeSummary) {
      return typeSummary.type;
    }
    return this._getTypeMetadata(type, dependencies);
  }

  private _getTypeMetadata(
      type: Type<any>, dependencies: any[]|null = null,
      throwOnUnknownDeps = true): cpl.CompileTypeMetadata {
    const identifier = this._getIdentifierMetadata(type);
    return {
      reference: identifier.reference,
      diDeps: this._getDependenciesMetadata(identifier.reference, dependencies, throwOnUnknownDeps),
      lifecycleHooks:
          ɵLIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, identifier.reference)),
    };
  }

  private _getFactoryMetadata(factory: Function, dependencies: any[]|null = null):
      cpl.CompileFactoryMetadata {
    factory = resolveForwardRef(factory);
    return {reference: factory, diDeps: this._getDependenciesMetadata(factory, dependencies)};
  }

  /**
   * Gets the metadata for the given pipe.
   * This assumes `loadNgModuleDirectiveAndPipeMetadata` has been called first.
   */
  getPipeMetadata(pipeType: any): cpl.CompilePipeMetadata|null {
    const pipeMeta = this._pipeCache.get(pipeType);
    if (!pipeMeta) {
      this._reportError(
          syntaxError(
              `Illegal state: getPipeMetadata can only be called after loadNgModuleDirectiveAndPipeMetadata for a module that declares it. Pipe ${stringifyType(pipeType)}.`),
          pipeType);
    }
    return pipeMeta || null;
  }

  getPipeSummary(pipeType: any): cpl.CompilePipeSummary {
    const pipeSummary =
        <cpl.CompilePipeSummary>this._loadSummary(pipeType, cpl.CompileSummaryKind.Pipe);
    if (!pipeSummary) {
      this._reportError(
          syntaxError(
              `Illegal state: Could not load the summary for pipe ${stringifyType(pipeType)}.`),
          pipeType);
    }
    return pipeSummary;
  }

  getOrLoadPipeMetadata(pipeType: any): cpl.CompilePipeMetadata {
    let pipeMeta = this._pipeCache.get(pipeType);
    if (!pipeMeta) {
      pipeMeta = this._loadPipeMetadata(pipeType);
    }
    return pipeMeta;
  }

  private _loadPipeMetadata(pipeType: any): cpl.CompilePipeMetadata {
    pipeType = resolveForwardRef(pipeType);
    const pipeAnnotation = this._pipeResolver.resolve(pipeType) !;

    const pipeMeta = new cpl.CompilePipeMetadata({
      type: this._getTypeMetadata(pipeType),
      name: pipeAnnotation.name,
      pure: !!pipeAnnotation.pure
    });
    this._pipeCache.set(pipeType, pipeMeta);
    this._summaryCache.set(pipeType, pipeMeta.toSummary());
    return pipeMeta;
  }

  private _getDependenciesMetadata(
      typeOrFunc: Type<any>|Function, dependencies: any[]|null,
      throwOnUnknownDeps = true): cpl.CompileDiDependencyMetadata[] {
    let hasUnknownDeps = false;
    const params = dependencies || this._reflector.parameters(typeOrFunc) || [];

    const dependenciesMetadata: cpl.CompileDiDependencyMetadata[] = params.map((param) => {
      let isAttribute = false;
      let isHost = false;
      let isSelf = false;
      let isSkipSelf = false;
      let isOptional = false;
      let token: any = null;
      if (Array.isArray(param)) {
        param.forEach((paramEntry) => {
          if (paramEntry instanceof Host) {
            isHost = true;
          } else if (paramEntry instanceof Self) {
            isSelf = true;
          } else if (paramEntry instanceof SkipSelf) {
            isSkipSelf = true;
          } else if (paramEntry instanceof Optional) {
            isOptional = true;
          } else if (paramEntry instanceof Attribute) {
            isAttribute = true;
            token = paramEntry.attributeName;
          } else if (paramEntry instanceof Inject) {
            token = paramEntry.token;
          } else if (paramEntry instanceof InjectionToken) {
            token = paramEntry;
          } else if (isValidType(paramEntry) && token == null) {
            token = paramEntry;
          }
        });
      } else {
        token = param;
      }
      if (token == null) {
        hasUnknownDeps = true;
        return null !;
      }

      return {
        isAttribute,
        isHost,
        isSelf,
        isSkipSelf,
        isOptional,
        token: this._getTokenMetadata(token)
      };

    });

    if (hasUnknownDeps) {
      const depsTokens =
          dependenciesMetadata.map((dep) => dep ? stringifyType(dep.token) : '?').join(', ');
      const message =
          `Can't resolve all parameters for ${stringifyType(typeOrFunc)}: (${depsTokens}).`;
      if (throwOnUnknownDeps) {
        this._reportError(syntaxError(message), typeOrFunc);
      } else {
        this._console.warn(`Warning: ${message} This will become an error in Angular v5.x`);
      }
    }

    return dependenciesMetadata;
  }

  private _getTokenMetadata(token: any): cpl.CompileTokenMetadata {
    token = resolveForwardRef(token);
    let compileToken: cpl.CompileTokenMetadata;
    if (typeof token === 'string') {
      compileToken = {value: token};
    } else {
      compileToken = {identifier: {reference: token}};
    }
    return compileToken;
  }

  private _getProvidersMetadata(
      providers: Provider[], targetEntryComponents: cpl.CompileEntryComponentMetadata[],
      debugInfo?: string, compileProviders: cpl.CompileProviderMetadata[] = [],
      type?: any): cpl.CompileProviderMetadata[] {
    providers.forEach((provider: any, providerIdx: number) => {
      if (Array.isArray(provider)) {
        this._getProvidersMetadata(provider, targetEntryComponents, debugInfo, compileProviders);
      } else {
        provider = resolveForwardRef(provider);
        let providerMeta: cpl.ProviderMeta = undefined !;
        if (provider && typeof provider === 'object' && provider.hasOwnProperty('provide')) {
          this._validateProvider(provider);
          providerMeta = new cpl.ProviderMeta(provider.provide, provider);
        } else if (isValidType(provider)) {
          providerMeta = new cpl.ProviderMeta(provider, {useClass: provider});
        } else if (provider === void 0) {
          this._reportError(syntaxError(
              `Encountered undefined provider! Usually this means you have a circular dependencies (might be caused by using 'barrel' index.ts files.`));
          return;
        } else {
          const providersInfo =
              (<string[]>providers.reduce(
                   (soFar: string[], seenProvider: any, seenProviderIdx: number) => {
                     if (seenProviderIdx < providerIdx) {
                       soFar.push(`${stringifyType(seenProvider)}`);
                     } else if (seenProviderIdx == providerIdx) {
                       soFar.push(`?${stringifyType(seenProvider)}?`);
                     } else if (seenProviderIdx == providerIdx + 1) {
                       soFar.push('...');
                     }
                     return soFar;
                   },
                   []))
                  .join(', ');
          this._reportError(
              syntaxError(
                  `Invalid ${debugInfo ? debugInfo : 'provider'} - only instances of Provider and Type are allowed, got: [${providersInfo}]`),
              type);
          return;
        }
        if (providerMeta.token === resolveIdentifier(Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS)) {
          targetEntryComponents.push(...this._getEntryComponentsFromProvider(providerMeta, type));
        } else {
          compileProviders.push(this.getProviderMetadata(providerMeta));
        }
      }
    });
    return compileProviders;
  }

  private _validateProvider(provider: any): void {
    if (provider.hasOwnProperty('useClass') && provider.useClass == null) {
      this._reportError(syntaxError(
          `Invalid provider for ${stringifyType(provider.provide)}. useClass cannot be ${provider.useClass}.
           Usually it happens when:
           1. There's a circular dependency (might be caused by using index.ts (barrel) files).
           2. Class was used before it was declared. Use forwardRef in this case.`));
    }
  }

  private _getEntryComponentsFromProvider(provider: cpl.ProviderMeta, type?: any):
      cpl.CompileEntryComponentMetadata[] {
    const components: cpl.CompileEntryComponentMetadata[] = [];
    const collectedIdentifiers: cpl.CompileIdentifierMetadata[] = [];

    if (provider.useFactory || provider.useExisting || provider.useClass) {
      this._reportError(
          syntaxError(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports useValue!`), type);
      return [];
    }

    if (!provider.multi) {
      this._reportError(
          syntaxError(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports 'multi = true'!`),
          type);
      return [];
    }

    extractIdentifiers(provider.useValue, collectedIdentifiers);
    collectedIdentifiers.forEach((identifier) => {
      const entry = this._getEntryComponentMetadata(identifier.reference, false);
      if (entry) {
        components.push(entry);
      }
    });
    return components;
  }

  private _getEntryComponentMetadata(dirType: any, throwIfNotFound = true):
      cpl.CompileEntryComponentMetadata|null {
    const dirMeta = this.getNonNormalizedDirectiveMetadata(dirType);
    if (dirMeta && dirMeta.metadata.isComponent) {
      return {componentType: dirType, componentFactory: dirMeta.metadata.componentFactory !};
    }
    const dirSummary =
        <cpl.CompileDirectiveSummary>this._loadSummary(dirType, cpl.CompileSummaryKind.Directive);
    if (dirSummary && dirSummary.isComponent) {
      return {componentType: dirType, componentFactory: dirSummary.componentFactory !};
    }
    if (throwIfNotFound) {
      throw syntaxError(`${dirType.name} cannot be used as an entry component.`);
    }
    return null;
  }

  getProviderMetadata(provider: cpl.ProviderMeta): cpl.CompileProviderMetadata {
    let compileDeps: cpl.CompileDiDependencyMetadata[] = undefined !;
    let compileTypeMetadata: cpl.CompileTypeMetadata = null !;
    let compileFactoryMetadata: cpl.CompileFactoryMetadata = null !;
    let token: cpl.CompileTokenMetadata = this._getTokenMetadata(provider.token);

    if (provider.useClass) {
      compileTypeMetadata = this._getInjectableMetadata(provider.useClass, provider.dependencies);
      compileDeps = compileTypeMetadata.diDeps;
      if (provider.token === provider.useClass) {
        // use the compileTypeMetadata as it contains information about lifecycleHooks...
        token = {identifier: compileTypeMetadata};
      }
    } else if (provider.useFactory) {
      compileFactoryMetadata = this._getFactoryMetadata(provider.useFactory, provider.dependencies);
      compileDeps = compileFactoryMetadata.diDeps;
    }

    return {
      token: token,
      useClass: compileTypeMetadata,
      useValue: provider.useValue,
      useFactory: compileFactoryMetadata,
      useExisting: provider.useExisting ? this._getTokenMetadata(provider.useExisting) : undefined,
      deps: compileDeps,
      multi: provider.multi
    };
  }

  private _getQueriesMetadata(
      queries: {[key: string]: Query}, isViewQuery: boolean,
      directiveType: Type<any>): cpl.CompileQueryMetadata[] {
    const res: cpl.CompileQueryMetadata[] = [];

    Object.keys(queries).forEach((propertyName: string) => {
      const query = queries[propertyName];
      if (query.isViewQuery === isViewQuery) {
        res.push(this._getQueryMetadata(query, propertyName, directiveType));
      }
    });

    return res;
  }

  private _queryVarBindings(selector: any): string[] { return selector.split(/\s*,\s*/); }

  private _getQueryMetadata(q: Query, propertyName: string, typeOrFunc: Type<any>|Function):
      cpl.CompileQueryMetadata {
    let selectors: cpl.CompileTokenMetadata[];
    if (typeof q.selector === 'string') {
      selectors =
          this._queryVarBindings(q.selector).map(varName => this._getTokenMetadata(varName));
    } else {
      if (!q.selector) {
        this._reportError(
            syntaxError(
                `Can't construct a query for the property "${propertyName}" of "${stringifyType(typeOrFunc)}" since the query selector wasn't defined.`),
            typeOrFunc);
        selectors = [];
      } else {
        selectors = [this._getTokenMetadata(q.selector)];
      }
    }

    return {
      selectors,
      first: q.first,
      descendants: q.descendants, propertyName,
      read: q.read ? this._getTokenMetadata(q.read) : null !
    };
  }

  private _reportError(error: any, type?: any, otherType?: any) {
    if (this._errorCollector) {
      this._errorCollector(error, type);
      if (otherType) {
        this._errorCollector(error, otherType);
      }
    } else {
      throw error;
    }
  }
}

function flattenArray(tree: any[], out: Array<any> = []): Array<any> {
  if (tree) {
    for (let i = 0; i < tree.length; i++) {
      const item = resolveForwardRef(tree[i]);
      if (Array.isArray(item)) {
        flattenArray(item, out);
      } else {
        out.push(item);
      }
    }
  }
  return out;
}

function dedupeArray(array: any[]): Array<any> {
  if (array) {
    return Array.from(new Set(array));
  }
  return [];
}

function flattenAndDedupeArray(tree: any[]): Array<any> {
  return dedupeArray(flattenArray(tree));
}

function isValidType(value: any): boolean {
  return (value instanceof StaticSymbol) || (value instanceof Type);
}

export function componentModuleUrl(
    reflector: ɵReflectorReader, type: Type<any>, cmpMetadata: Component): string {
  if (type instanceof StaticSymbol) {
    return reflector.resourceUri(type);
  }

  const moduleId = cmpMetadata.moduleId;

  if (typeof moduleId === 'string') {
    const scheme = getUrlScheme(moduleId);
    return scheme ? moduleId : `package:${moduleId}${MODULE_SUFFIX}`;
  } else if (moduleId !== null && moduleId !== void 0) {
    throw syntaxError(
        `moduleId should be a string in "${stringifyType(type)}". See https://goo.gl/wIDDiL for more information.\n` +
        `If you're using Webpack you should inline the template and the styles, see https://goo.gl/X2J8zc.`);
  }

  return reflector.importUri(type) !;
}

function extractIdentifiers(value: any, targetIdentifiers: cpl.CompileIdentifierMetadata[]) {
  visitValue(value, new _CompileValueConverter(), targetIdentifiers);
}

class _CompileValueConverter extends ValueTransformer {
  visitOther(value: any, targetIdentifiers: cpl.CompileIdentifierMetadata[]): any {
    targetIdentifiers.push({reference: value});
  }
}

function stringifyType(type: any): string {
  if (type instanceof StaticSymbol) {
    return `${type.name} in ${type.filePath}`;
  } else {
    return stringify(type);
  }
}

/**
 * Indicates that a component is still being loaded in a synchronous compile.
 */
function componentStillLoadingError(compType: Type<any>) {
  const error =
      Error(`Can't compile synchronously as ${stringify(compType)} is still being loaded!`);
  (error as any)[ɵERROR_COMPONENT_TYPE] = compType;
  return error;
}
