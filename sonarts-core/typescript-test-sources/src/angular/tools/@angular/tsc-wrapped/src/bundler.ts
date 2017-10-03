/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as path from 'path';
import * as ts from 'typescript';

import {MetadataCollector} from './collector';
import {ClassMetadata, ConstructorMetadata, FunctionMetadata, MemberMetadata, MetadataEntry, MetadataError, MetadataImportedSymbolReferenceExpression, MetadataMap, MetadataObject, MetadataSymbolicExpression, MetadataSymbolicReferenceExpression, MetadataValue, MethodMetadata, ModuleMetadata, VERSION, isClassMetadata, isConstructorMetadata, isFunctionMetadata, isInterfaceMetadata, isMetadataError, isMetadataGlobalReferenceExpression, isMetadataImportedSymbolReferenceExpression, isMetadataModuleReferenceExpression, isMetadataSymbolicExpression, isMethodMetadata} from './schema';


// The character set used to produce private names.
const PRIVATE_NAME_CHARS = 'abcdefghijklmnopqrstuvwxyz';

interface Symbol {
  module: string;
  name: string;

  // Produced by indirectly by exportAll() for symbols re-export another symbol.
  exports?: Symbol;

  // Produced by indirectly by exportAll() for symbols are re-exported by another symbol.
  reexportedAs?: Symbol;

  // Produced by canonicalizeSymbols() for all symbols. A symbol is private if it is not
  // exported by the index.
  isPrivate?: boolean;

  // Produced by canonicalizeSymbols() for all symbols. This is the one symbol that
  // respresents all other symbols and is the only symbol that, among all the re-exported
  // aliases, whose fields can be trusted to contain the correct information.
  // For private symbols this is the declaration symbol. For public symbols this is the
  // symbol that is exported.
  canonicalSymbol?: Symbol;

  // Produced by canonicalizeSymbols() for all symbols. This the symbol that originally
  // declared the value and should be used to fetch the value.
  declaration?: Symbol;

  // A symbol is referenced if it is exported from index or referenced by the value of
  // a referenced symbol's value.
  referenced?: boolean;

  // Only valid for referenced canonical symbols. Produces by convertSymbols().
  value?: MetadataEntry;

  // Only valid for referenced private symbols. It is the name to use to import the symbol from
  // the bundle index. Produce by assignPrivateNames();
  privateName?: string;
}

export interface BundleEntries { [name: string]: MetadataEntry; }

export interface BundlePrivateEntry {
  privateName: string;
  name: string;
  module: string;
}

export interface BundledModule {
  metadata: ModuleMetadata;
  privates: BundlePrivateEntry[];
}

export interface MetadataBundlerHost { getMetadataFor(moduleName: string): ModuleMetadata; }

type StaticsMetadata = {
  [name: string]: MetadataValue | FunctionMetadata;
};

export class MetadataBundler {
  private symbolMap = new Map<string, Symbol>();
  private metadataCache = new Map<string, ModuleMetadata>();
  private exports = new Map<string, Symbol[]>();
  private rootModule: string;
  private exported: Set<Symbol>;

  constructor(
      private root: string, private importAs: string|undefined, private host: MetadataBundlerHost) {
    this.rootModule = `./${path.basename(root)}`;
  }

  getMetadataBundle(): BundledModule {
    // Export the root module. This also collects the transitive closure of all values referenced by
    // the exports.
    const exportedSymbols = this.exportAll(this.rootModule);
    this.canonicalizeSymbols(exportedSymbols);
    // TODO: exports? e.g. a module re-exports a symbol from another bundle
    const metadata = this.getEntries(exportedSymbols);
    const privates = Array.from(this.symbolMap.values())
                         .filter(s => s.referenced && s.isPrivate)
                         .map(s => ({
                                privateName: s.privateName,
                                name: s.declaration.name,
                                module: s.declaration.module
                              }));
    const origins = Array.from(this.symbolMap.values())
                        .filter(s => s.referenced)
                        .reduce<{[name: string]: string}>((p, s) => {
                          p[s.isPrivate ? s.privateName : s.name] = s.declaration.module;
                          return p;
                        }, {});
    return {
      metadata:
          {__symbolic: 'module', version: VERSION, metadata, origins, importAs: this.importAs},
      privates
    };
  }

  static resolveModule(importName: string, from: string): string {
    return resolveModule(importName, from);
  }

  private getMetadata(moduleName: string): ModuleMetadata {
    let result = this.metadataCache.get(moduleName);
    if (!result) {
      if (moduleName.startsWith('.')) {
        const fullModuleName = resolveModule(moduleName, this.root);
        result = this.host.getMetadataFor(fullModuleName);
      }
      this.metadataCache.set(moduleName, result);
    }
    return result;
  }

  private exportAll(moduleName: string): Symbol[] {
    const module = this.getMetadata(moduleName);
    let result: Symbol[] = this.exports.get(moduleName);

    if (result) {
      return result;
    }

    result = [];

    const exportSymbol = (exportedSymbol: Symbol, exportAs: string) => {
      const symbol = this.symbolOf(moduleName, exportAs);
      result.push(symbol);
      exportedSymbol.reexportedAs = symbol;
      symbol.exports = exportedSymbol;
    };

    // Export all the symbols defined in this module.
    if (module && module.metadata) {
      for (let key in module.metadata) {
        const data = module.metadata[key];
        if (isMetadataImportedSymbolReferenceExpression(data)) {
          // This is a re-export of an imported symbol. Record this as a re-export.
          const exportFrom = resolveModule(data.module, moduleName);
          this.exportAll(exportFrom);
          const symbol = this.symbolOf(exportFrom, data.name);
          exportSymbol(symbol, key);
        } else {
          // Record that this symbol is exported by this module.
          result.push(this.symbolOf(moduleName, key));
        }
      }
    }

    // Export all the re-exports from this module
    if (module && module.exports) {
      for (const exportDeclaration of module.exports) {
        const exportFrom = resolveModule(exportDeclaration.from, moduleName);
        // Record all the exports from the module even if we don't use it directly.
        this.exportAll(exportFrom);
        if (exportDeclaration.export) {
          // Re-export all the named exports from a module.
          for (const exportItem of exportDeclaration.export) {
            const name = typeof exportItem == 'string' ? exportItem : exportItem.name;
            const exportAs = typeof exportItem == 'string' ? exportItem : exportItem.as;
            exportSymbol(this.symbolOf(exportFrom, name), exportAs);
          }
        } else {
          // Re-export all the symbols from the module
          const exportedSymbols = this.exportAll(exportFrom);
          for (const exportedSymbol of exportedSymbols) {
            const name = exportedSymbol.name;
            exportSymbol(exportedSymbol, name);
          }
        }
      }
    }
    this.exports.set(moduleName, result);

    return result;
  }

  /**
   * Fill in the canonicalSymbol which is the symbol that should be imported by factories.
   * The canonical symbol is the one exported by the index file for the bundle or definition
   * symbol for private symbols that are not exported by bundle index.
   */
  private canonicalizeSymbols(exportedSymbols: Symbol[]) {
    const symbols = Array.from(this.symbolMap.values());
    this.exported = new Set(exportedSymbols);
    symbols.forEach(this.canonicalizeSymbol, this);
  }

  private canonicalizeSymbol(symbol: Symbol) {
    const rootExport = getRootExport(symbol);
    const declaration = getSymbolDeclaration(symbol);
    const isPrivate = !this.exported.has(rootExport);
    const canonicalSymbol = isPrivate ? declaration : rootExport;
    symbol.isPrivate = isPrivate;
    symbol.declaration = declaration;
    symbol.canonicalSymbol = canonicalSymbol;
  }

  private getEntries(exportedSymbols: Symbol[]): BundleEntries {
    const result: BundleEntries = {};

    const exportedNames = new Set(exportedSymbols.map(s => s.name));
    let privateName = 0;

    function newPrivateName(): string {
      while (true) {
        let digits: string[] = [];
        let index = privateName++;
        let base = PRIVATE_NAME_CHARS;
        while (!digits.length || index > 0) {
          digits.unshift(base[index % base.length]);
          index = Math.floor(index / base.length);
        }
        digits.unshift('\u0275');
        const result = digits.join('');
        if (!exportedNames.has(result)) return result;
      }
    }

    exportedSymbols.forEach(symbol => this.convertSymbol(symbol));

    Array.from(this.symbolMap.values()).forEach(symbol => {
      if (symbol.referenced) {
        let name = symbol.name;
        if (symbol.isPrivate && !symbol.privateName) {
          name = newPrivateName();
          symbol.privateName = name;
        }
        result[name] = symbol.value;
      }
    });

    return result;
  }

  private convertSymbol(symbol: Symbol) {
    const canonicalSymbol = symbol.canonicalSymbol;

    if (!canonicalSymbol.referenced) {
      canonicalSymbol.referenced = true;
      const declaration = canonicalSymbol.declaration;
      const module = this.getMetadata(declaration.module);
      if (module) {
        const value = module.metadata[declaration.name];
        if (value && !declaration.name.startsWith('___')) {
          canonicalSymbol.value = this.convertEntry(declaration.module, value);
        }
      }
    }
  }

  private convertEntry(moduleName: string, value: MetadataEntry): MetadataEntry {
    if (isClassMetadata(value)) {
      return this.convertClass(moduleName, value);
    }
    if (isFunctionMetadata(value)) {
      return this.convertFunction(moduleName, value);
    }
    if (isInterfaceMetadata(value)) {
      return value;
    }
    return this.convertValue(moduleName, value);
  }

  private convertClass(moduleName: string, value: ClassMetadata): ClassMetadata {
    return {
      __symbolic: 'class',
      arity: value.arity,
      extends: this.convertExpression(moduleName, value.extends),
      decorators:
          value.decorators && value.decorators.map(d => this.convertExpression(moduleName, d)),
      members: this.convertMembers(moduleName, value.members),
      statics: value.statics && this.convertStatics(moduleName, value.statics)
    };
  }

  private convertMembers(moduleName: string, members: MetadataMap): MetadataMap {
    const result: MetadataMap = {};
    for (const name in members) {
      const value = members[name];
      result[name] = value.map(v => this.convertMember(moduleName, v));
    }
    return result;
  }

  private convertMember(moduleName: string, member: MemberMetadata) {
    const result: MemberMetadata = {__symbolic: member.__symbolic};
    result.decorators =
        member.decorators && member.decorators.map(d => this.convertExpression(moduleName, d));
    if (isMethodMetadata(member)) {
      (result as MethodMetadata).parameterDecorators = member.parameterDecorators &&
          member.parameterDecorators.map(
              d => d && d.map(p => this.convertExpression(moduleName, p)));
      if (isConstructorMetadata(member)) {
        if (member.parameters) {
          (result as ConstructorMetadata).parameters =
              member.parameters.map(p => this.convertExpression(moduleName, p));
        }
      }
    }
    return result;
  }

  private convertStatics(moduleName: string, statics: StaticsMetadata): StaticsMetadata {
    let result: StaticsMetadata = {};
    for (const key in statics) {
      const value = statics[key];
      result[key] = isFunctionMetadata(value) ? this.convertFunction(moduleName, value) : value;
    }
    return result;
  }

  private convertFunction(moduleName: string, value: FunctionMetadata): FunctionMetadata {
    return {
      __symbolic: 'function',
      parameters: value.parameters,
      defaults: value.defaults && value.defaults.map(v => this.convertValue(moduleName, v)),
      value: this.convertValue(moduleName, value.value)
    };
  }

  private convertValue(moduleName: string, value: MetadataValue): MetadataValue {
    if (isPrimitive(value)) {
      return value;
    }
    if (isMetadataError(value)) {
      return this.convertError(moduleName, value);
    }
    if (isMetadataSymbolicExpression(value)) {
      return this.convertExpression(moduleName, value);
    }
    if (Array.isArray(value)) {
      return value.map(v => this.convertValue(moduleName, v));
    }

    // Otherwise it is a metadata object.
    const object = value as MetadataObject;
    const result: MetadataObject = {};
    for (const key in object) {
      result[key] = this.convertValue(moduleName, object[key]);
    }
    return result;
  }

  private convertExpression(
      moduleName: string, value: MetadataSymbolicExpression|MetadataError|
      undefined): MetadataSymbolicExpression|MetadataError|undefined {
    if (value) {
      switch (value.__symbolic) {
        case 'error':
          return this.convertError(moduleName, value as MetadataError);
        case 'reference':
          return this.convertReference(moduleName, value as MetadataSymbolicReferenceExpression);
        default:
          return this.convertExpressionNode(moduleName, value);
      }
    }
    return value;
  }

  private convertError(module: string, value: MetadataError): MetadataError {
    return {
      __symbolic: 'error',
      message: value.message,
      line: value.line,
      character: value.character,
      context: value.context, module
    };
  }

  private convertReference(moduleName: string, value: MetadataSymbolicReferenceExpression):
      MetadataSymbolicReferenceExpression|MetadataError {
    const createReference = (symbol: Symbol): MetadataSymbolicReferenceExpression => {
      const declaration = symbol.declaration;
      if (declaration.module.startsWith('.')) {
        // Reference to a symbol defined in the module. Ensure it is converted then return a
        // references to the final symbol.
        this.convertSymbol(symbol);
        return {
          __symbolic: 'reference',
          get name() {
            // Resolved lazily because private names are assigned late.
            const canonicalSymbol = symbol.canonicalSymbol;
            if (canonicalSymbol.isPrivate == null) {
              throw Error('Invalid state: isPrivate was not initialized');
            }
            return canonicalSymbol.isPrivate ? canonicalSymbol.privateName : canonicalSymbol.name;
          }
        };
      } else {
        // The symbol was a re-exported symbol from another module. Return a reference to the
        // original imported symbol.
        return {__symbolic: 'reference', name: declaration.name, module: declaration.module};
      }
    };

    if (isMetadataGlobalReferenceExpression(value)) {
      const metadata = this.getMetadata(moduleName);
      if (metadata && metadata.metadata && metadata.metadata[value.name]) {
        // Reference to a symbol defined in the module
        return createReference(this.canonicalSymbolOf(moduleName, value.name));
      }

      // If a reference has arguments, the arguments need to be converted.
      if (value.arguments) {
        return {
          __symbolic: 'reference',
          name: value.name,
          arguments: value.arguments.map(a => this.convertValue(moduleName, a))
        };
      }

      // Global references without arguments (such as to Math or JSON) are unmodified.
      return value;
    }

    if (isMetadataImportedSymbolReferenceExpression(value)) {
      // References to imported symbols are separated into two, references to bundled modules and
      // references to modules external to the bundle. If the module reference is relative it is
      // assumed to be in the bundle. If it is Global it is assumed to be outside the bundle.
      // References to symbols outside the bundle are left unmodified. References to symbol inside
      // the bundle need to be converted to a bundle import reference reachable from the bundle
      // index.

      if (value.module.startsWith('.')) {
        // Reference is to a symbol defined inside the module. Convert the reference to a reference
        // to the canonical symbol.
        const referencedModule = resolveModule(value.module, moduleName);
        const referencedName = value.name;
        return createReference(this.canonicalSymbolOf(referencedModule, referencedName));
      }

      // Value is a reference to a symbol defined outside the module.
      if (value.arguments) {
        // If a reference has arguments the arguments need to be converted.
        return {
          __symbolic: 'reference',
          name: value.name,
          module: value.module,
          arguments: value.arguments.map(a => this.convertValue(moduleName, a))
        };
      }
      return value;
    }

    if (isMetadataModuleReferenceExpression(value)) {
      // Cannot support references to bundled modules as the internal modules of a bundle are erased
      // by the bundler.
      if (value.module.startsWith('.')) {
        return {
          __symbolic: 'error',
          message: 'Unsupported bundled module reference',
          context: {module: value.module}
        };
      }

      // References to unbundled modules are unmodified.
      return value;
    }
  }

  private convertExpressionNode(moduleName: string, value: MetadataSymbolicExpression):
      MetadataSymbolicExpression {
    const result: MetadataSymbolicExpression = {__symbolic: value.__symbolic};
    for (const key in value) {
      (result as any)[key] = this.convertValue(moduleName, (value as any)[key]);
    }
    return result;
  }

  private symbolOf(module: string, name: string): Symbol {
    const symbolKey = `${module}:${name}`;
    let symbol = this.symbolMap.get(symbolKey);
    if (!symbol) {
      symbol = {module, name};
      this.symbolMap.set(symbolKey, symbol);
    }
    return symbol;
  }

  private canonicalSymbolOf(module: string, name: string): Symbol {
    // Ensure the module has been seen.
    this.exportAll(module);
    const symbol = this.symbolOf(module, name);
    if (!symbol.canonicalSymbol) {
      this.canonicalizeSymbol(symbol);
    }
    return symbol;
  }
}

export class CompilerHostAdapter implements MetadataBundlerHost {
  private collector = new MetadataCollector();

  constructor(private host: ts.CompilerHost) {}

  getMetadataFor(fileName: string): ModuleMetadata {
    const sourceFile = this.host.getSourceFile(fileName + '.ts', ts.ScriptTarget.Latest);
    return this.collector.getMetadata(sourceFile);
  }
}

function resolveModule(importName: string, from: string): string {
  if (importName.startsWith('.') && from) {
    let normalPath = path.normalize(path.join(path.dirname(from), importName));
    if (!normalPath.startsWith('.') && from.startsWith('.')) {
      // path.normalize() preserves leading '../' but not './'. This adds it back.
      normalPath = `.${path.sep}${normalPath}`;
    }
    // Replace windows path delimiters with forward-slashes. Otherwise the paths are not
    // TypeScript compatible when building the bundle.
    return normalPath.replace(/\\/g, '/');
  }
  return importName;
}

function isPrimitive(o: any): o is boolean|string|number {
  return o === null || (typeof o !== 'function' && typeof o !== 'object');
}

function getRootExport(symbol: Symbol): Symbol {
  return symbol.reexportedAs ? getRootExport(symbol.reexportedAs) : symbol;
}

function getSymbolDeclaration(symbol: Symbol): Symbol {
  return symbol.exports ? getSymbolDeclaration(symbol.exports) : symbol;
}
