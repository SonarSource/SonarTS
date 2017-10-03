/* @internal */
namespace ts.codefix {
    registerCodeFix({
        errorCodes: [
            Diagnostics.Cannot_find_name_0.code,
            Diagnostics.Cannot_find_name_0_Did_you_mean_1.code,
            Diagnostics.Cannot_find_namespace_0.code,
            Diagnostics._0_refers_to_a_UMD_global_but_the_current_file_is_a_module_Consider_adding_an_import_instead.code
        ],
        getCodeActions: getImportCodeActions
    });

    type ImportCodeActionKind = "CodeChange" | "InsertingIntoExistingImport" | "NewImport";
    interface ImportCodeAction extends CodeAction {
        kind: ImportCodeActionKind;
        moduleSpecifier?: string;
    }

    enum ModuleSpecifierComparison {
        Better,
        Equal,
        Worse
    }

    class ImportCodeActionMap {
        private symbolIdToActionMap: ImportCodeAction[][] = [];

        addAction(symbolId: number, newAction: ImportCodeAction) {
            if (!newAction) {
                return;
            }

            const actions = this.symbolIdToActionMap[symbolId];
            if (!actions) {
                this.symbolIdToActionMap[symbolId] = [newAction];
                return;
            }

            if (newAction.kind === "CodeChange") {
                actions.push(newAction);
                return;
            }

            const updatedNewImports: ImportCodeAction[] = [];
            for (const existingAction of this.symbolIdToActionMap[symbolId]) {
                if (existingAction.kind === "CodeChange") {
                    // only import actions should compare
                    updatedNewImports.push(existingAction);
                    continue;
                }

                switch (this.compareModuleSpecifiers(existingAction.moduleSpecifier, newAction.moduleSpecifier)) {
                    case ModuleSpecifierComparison.Better:
                        // the new one is not worth considering if it is a new import.
                        // However if it is instead a insertion into existing import, the user might want to use
                        // the module specifier even it is worse by our standards. So keep it.
                        if (newAction.kind === "NewImport") {
                            return;
                        }
                        // falls through
                    case ModuleSpecifierComparison.Equal:
                        // the current one is safe. But it is still possible that the new one is worse
                        // than another existing one. For example, you may have new imports from "./foo/bar"
                        // and "bar", when the new one is "bar/bar2" and the current one is "./foo/bar". The new
                        // one and the current one are not comparable (one relative path and one absolute path),
                        // but the new one is worse than the other one, so should not add to the list.
                        updatedNewImports.push(existingAction);
                        break;
                    case ModuleSpecifierComparison.Worse:
                        // the existing one is worse, remove from the list.
                        continue;
                }
            }
            // if we reach here, it means the new one is better or equal to all of the existing ones.
            updatedNewImports.push(newAction);
            this.symbolIdToActionMap[symbolId] = updatedNewImports;
        }

        addActions(symbolId: number, newActions: ImportCodeAction[]) {
            for (const newAction of newActions) {
                this.addAction(symbolId, newAction);
            }
        }

        getAllActions() {
            let result: ImportCodeAction[] = [];
            for (const key in this.symbolIdToActionMap) {
                result = concatenate(result, this.symbolIdToActionMap[key]);
            }
            return result;
        }

        private compareModuleSpecifiers(moduleSpecifier1: string, moduleSpecifier2: string): ModuleSpecifierComparison {
            if (moduleSpecifier1 === moduleSpecifier2) {
                return ModuleSpecifierComparison.Equal;
            }

            // if moduleSpecifier1 (ms1) is a substring of ms2, then it is better
            if (moduleSpecifier2.indexOf(moduleSpecifier1) === 0) {
                return ModuleSpecifierComparison.Better;
            }

            if (moduleSpecifier1.indexOf(moduleSpecifier2) === 0) {
                return ModuleSpecifierComparison.Worse;
            }

            // if both are relative paths, and ms1 has fewer levels, then it is better
            if (isExternalModuleNameRelative(moduleSpecifier1) && isExternalModuleNameRelative(moduleSpecifier2)) {
                const regex = new RegExp(directorySeparator, "g");
                const moduleSpecifier1LevelCount = (moduleSpecifier1.match(regex) || []).length;
                const moduleSpecifier2LevelCount = (moduleSpecifier2.match(regex) || []).length;

                return moduleSpecifier1LevelCount < moduleSpecifier2LevelCount
                    ? ModuleSpecifierComparison.Better
                    : moduleSpecifier1LevelCount === moduleSpecifier2LevelCount
                        ? ModuleSpecifierComparison.Equal
                        : ModuleSpecifierComparison.Worse;
            }

            // the equal cases include when the two specifiers are not comparable.
            return ModuleSpecifierComparison.Equal;
        }
    }

    function getImportCodeActions(context: CodeFixContext): ImportCodeAction[] {
        const sourceFile = context.sourceFile;
        const checker = context.program.getTypeChecker();
        const allSourceFiles = context.program.getSourceFiles();
        const useCaseSensitiveFileNames = context.host.useCaseSensitiveFileNames ? context.host.useCaseSensitiveFileNames() : false;

        const token = getTokenAtPosition(sourceFile, context.span.start);
        const name = token.getText();
        const symbolIdActionMap = new ImportCodeActionMap();

        // this is a module id -> module import declaration map
        const cachedImportDeclarations: (ImportDeclaration | ImportEqualsDeclaration)[][] = [];
        let lastImportDeclaration: Node;

        const currentTokenMeaning = getMeaningFromLocation(token);
        if (context.errorCode === Diagnostics._0_refers_to_a_UMD_global_but_the_current_file_is_a_module_Consider_adding_an_import_instead.code) {
            const symbol = checker.getAliasedSymbol(checker.getSymbolAtLocation(token));
            return getCodeActionForImport(symbol, /*isDefault*/ false, /*isNamespaceImport*/ true);
        }

        const candidateModules = checker.getAmbientModules();
        for (const otherSourceFile of allSourceFiles) {
            if (otherSourceFile !== sourceFile && isExternalOrCommonJsModule(otherSourceFile)) {
                candidateModules.push(otherSourceFile.symbol);
            }
        }

        for (const moduleSymbol of candidateModules) {
            context.cancellationToken.throwIfCancellationRequested();

            // check the default export
            const defaultExport = checker.tryGetMemberInModuleExports("default", moduleSymbol);
            if (defaultExport) {
                const localSymbol = getLocalSymbolForExportDefault(defaultExport);
                if (localSymbol && localSymbol.name === name && checkSymbolHasMeaning(localSymbol, currentTokenMeaning)) {
                    // check if this symbol is already used
                    const symbolId = getUniqueSymbolId(localSymbol);
                    symbolIdActionMap.addActions(symbolId, getCodeActionForImport(moduleSymbol, /*isDefault*/ true));
                }
            }

            // check exports with the same name
            const exportSymbolWithIdenticalName = checker.tryGetMemberInModuleExports(name, moduleSymbol);
            if (exportSymbolWithIdenticalName && checkSymbolHasMeaning(exportSymbolWithIdenticalName, currentTokenMeaning)) {
                const symbolId = getUniqueSymbolId(exportSymbolWithIdenticalName);
                symbolIdActionMap.addActions(symbolId, getCodeActionForImport(moduleSymbol));
            }
        }

        return symbolIdActionMap.getAllActions();

        function getImportDeclarations(moduleSymbol: Symbol) {
            const moduleSymbolId = getUniqueSymbolId(moduleSymbol);

            const cached = cachedImportDeclarations[moduleSymbolId];
            if (cached) {
                return cached;
            }

            const existingDeclarations: (ImportDeclaration | ImportEqualsDeclaration)[] = [];
            for (const importModuleSpecifier of sourceFile.imports) {
                const importSymbol = checker.getSymbolAtLocation(importModuleSpecifier);
                if (importSymbol === moduleSymbol) {
                    existingDeclarations.push(getImportDeclaration(importModuleSpecifier));
                }
            }
            cachedImportDeclarations[moduleSymbolId] = existingDeclarations;
            return existingDeclarations;

            function getImportDeclaration(moduleSpecifier: LiteralExpression) {
                let node: Node = moduleSpecifier;
                while (node) {
                    if (node.kind === SyntaxKind.ImportDeclaration) {
                        return <ImportDeclaration>node;
                    }
                    if (node.kind === SyntaxKind.ImportEqualsDeclaration) {
                        return <ImportEqualsDeclaration>node;
                    }
                    node = node.parent;
                }
                return undefined;
            }
        }

        function getUniqueSymbolId(symbol: Symbol) {
            if (symbol.flags & SymbolFlags.Alias) {
                return getSymbolId(checker.getAliasedSymbol(symbol));
            }
            return getSymbolId(symbol);
        }

        function checkSymbolHasMeaning(symbol: Symbol, meaning: SemanticMeaning) {
            const declarations = symbol.getDeclarations();
            return declarations ? some(symbol.declarations, decl => !!(getMeaningFromDeclaration(decl) & meaning)) : false;
        }

        function getCodeActionForImport(moduleSymbol: Symbol, isDefault?: boolean, isNamespaceImport?: boolean): ImportCodeAction[] {
            const existingDeclarations = getImportDeclarations(moduleSymbol);
            if (existingDeclarations.length > 0) {
                // With an existing import statement, there are more than one actions the user can do.
                return getCodeActionsForExistingImport(existingDeclarations);
            }
            else {
                return [getCodeActionForNewImport()];
            }

            function getCodeActionsForExistingImport(declarations: (ImportDeclaration | ImportEqualsDeclaration)[]): ImportCodeAction[] {
                const actions: ImportCodeAction[] = [];

                // It is possible that multiple import statements with the same specifier exist in the file.
                // e.g.
                //
                //     import * as ns from "foo";
                //     import { member1, member2 } from "foo";
                //
                //     member3/**/ <-- cusor here
                //
                // in this case we should provie 2 actions:
                //     1. change "member3" to "ns.member3"
                //     2. add "member3" to the second import statement's import list
                // and it is up to the user to decide which one fits best.
                let namespaceImportDeclaration: ImportDeclaration | ImportEqualsDeclaration;
                let namedImportDeclaration: ImportDeclaration;
                let existingModuleSpecifier: string;
                for (const declaration of declarations) {
                    if (declaration.kind === SyntaxKind.ImportDeclaration) {
                        const namedBindings = declaration.importClause && declaration.importClause.namedBindings;
                        if (namedBindings && namedBindings.kind === SyntaxKind.NamespaceImport) {
                            // case:
                            // import * as ns from "foo"
                            namespaceImportDeclaration = declaration;
                        }
                        else {
                            // cases:
                            // import default from "foo"
                            // import { bar } from "foo" or combination with the first one
                            // import "foo"
                            namedImportDeclaration = declaration;
                        }
                        existingModuleSpecifier = declaration.moduleSpecifier.getText();
                    }
                    else {
                        // case:
                        // import foo = require("foo")
                        namespaceImportDeclaration = declaration;
                        existingModuleSpecifier = getModuleSpecifierFromImportEqualsDeclaration(declaration);
                    }
                }

                if (namespaceImportDeclaration) {
                    actions.push(getCodeActionForNamespaceImport(namespaceImportDeclaration));
                }

                if (!isNamespaceImport && namedImportDeclaration && namedImportDeclaration.importClause &&
                    (namedImportDeclaration.importClause.name || namedImportDeclaration.importClause.namedBindings)) {
                    /**
                     * If the existing import declaration already has a named import list, just
                     * insert the identifier into that list.
                     */
                    const fileTextChanges = getTextChangeForImportClause(namedImportDeclaration.importClause);
                    const moduleSpecifierWithoutQuotes = stripQuotes(namedImportDeclaration.moduleSpecifier.getText());
                    actions.push(createCodeAction(
                        Diagnostics.Add_0_to_existing_import_declaration_from_1,
                        [name, moduleSpecifierWithoutQuotes],
                        fileTextChanges,
                        "InsertingIntoExistingImport",
                        moduleSpecifierWithoutQuotes
                    ));
                }
                else {
                    // we need to create a new import statement, but the existing module specifier can be reused.
                    actions.push(getCodeActionForNewImport(existingModuleSpecifier));
                }
                return actions;

                function getModuleSpecifierFromImportEqualsDeclaration(declaration: ImportEqualsDeclaration) {
                    if (declaration.moduleReference && declaration.moduleReference.kind === SyntaxKind.ExternalModuleReference) {
                        return declaration.moduleReference.expression.getText();
                    }
                    return declaration.moduleReference.getText();
                }

                function getTextChangeForImportClause(importClause: ImportClause): FileTextChanges[] {
                    const importList = <NamedImports>importClause.namedBindings;
                    const newImportSpecifier = createImportSpecifier(/*propertyName*/ undefined, createIdentifier(name));
                    // case 1:
                    // original text: import default from "module"
                    // change to: import default, { name } from "module"
                    // case 2:
                    // original text: import {} from "module"
                    // change to: import { name } from "module"
                    if (!importList || importList.elements.length === 0) {
                        const newImportClause = createImportClause(importClause.name, createNamedImports([newImportSpecifier]));
                        return createChangeTracker().replaceNode(sourceFile, importClause, newImportClause).getChanges();
                    }

                    /**
                     * If the import list has one import per line, preserve that. Otherwise, insert on same line as last element
                     *     import {
                     *         foo
                     *     } from "./module";
                     */
                    return createChangeTracker().insertNodeInListAfter(
                        sourceFile,
                        importList.elements[importList.elements.length - 1],
                        newImportSpecifier).getChanges();
                }

                function getCodeActionForNamespaceImport(declaration: ImportDeclaration | ImportEqualsDeclaration): ImportCodeAction {
                    let namespacePrefix: string;
                    if (declaration.kind === SyntaxKind.ImportDeclaration) {
                        namespacePrefix = (<NamespaceImport>declaration.importClause.namedBindings).name.getText();
                    }
                    else {
                        namespacePrefix = declaration.name.getText();
                    }
                    namespacePrefix = stripQuotes(namespacePrefix);

                    /**
                     * Cases:
                     *     import * as ns from "mod"
                     *     import default, * as ns from "mod"
                     *     import ns = require("mod")
                     *
                     * Because there is no import list, we alter the reference to include the
                     * namespace instead of altering the import declaration. For example, "foo" would
                     * become "ns.foo"
                     */
                    return createCodeAction(
                        Diagnostics.Change_0_to_1,
                        [name, `${namespacePrefix}.${name}`],
                        createChangeTracker().replaceNode(sourceFile, token, createPropertyAccess(createIdentifier(namespacePrefix), name)).getChanges(),
                        "CodeChange"
                    );
                }
            }

            function getCodeActionForNewImport(moduleSpecifier?: string): ImportCodeAction {
                if (!lastImportDeclaration) {
                    // insert after any existing imports
                    for (let i = sourceFile.statements.length - 1; i >= 0; i--) {
                        const statement = sourceFile.statements[i];
                        if (statement.kind === SyntaxKind.ImportEqualsDeclaration || statement.kind === SyntaxKind.ImportDeclaration) {
                            lastImportDeclaration = statement;
                            break;
                        }
                    }
                }

                const getCanonicalFileName = createGetCanonicalFileName(useCaseSensitiveFileNames);
                const moduleSpecifierWithoutQuotes = stripQuotes(moduleSpecifier || getModuleSpecifierForNewImport());
                const changeTracker = createChangeTracker();
                const importClause = isDefault
                    ? createImportClause(createIdentifier(name), /*namedBindings*/ undefined)
                    : isNamespaceImport
                        ? createImportClause(/*name*/ undefined, createNamespaceImport(createIdentifier(name)))
                        : createImportClause(/*name*/ undefined, createNamedImports([createImportSpecifier(/*propertyName*/ undefined, createIdentifier(name))]));
                const importDecl = createImportDeclaration(/*decorators*/ undefined, /*modifiers*/ undefined, importClause, createLiteral(moduleSpecifierWithoutQuotes));
                if (!lastImportDeclaration) {
                    changeTracker.insertNodeAt(sourceFile, sourceFile.getStart(), importDecl, { suffix: `${context.newLineCharacter}${context.newLineCharacter}` });
                }
                else {
                    changeTracker.insertNodeAfter(sourceFile, lastImportDeclaration, importDecl, { suffix: context.newLineCharacter });
                }

                // if this file doesn't have any import statements, insert an import statement and then insert a new line
                // between the only import statement and user code. Otherwise just insert the statement because chances
                // are there are already a new line seperating code and import statements.
                return createCodeAction(
                    Diagnostics.Import_0_from_1,
                    [name, `"${moduleSpecifierWithoutQuotes}"`],
                    changeTracker.getChanges(),
                    "NewImport",
                    moduleSpecifierWithoutQuotes
                );

                function getModuleSpecifierForNewImport() {
                    const fileName = sourceFile.fileName;
                    const moduleFileName = moduleSymbol.valueDeclaration.getSourceFile().fileName;
                    const sourceDirectory = getDirectoryPath(fileName);
                    const options = context.program.getCompilerOptions();

                    return tryGetModuleNameFromAmbientModule() ||
                        tryGetModuleNameFromTypeRoots() ||
                        tryGetModuleNameAsNodeModule() ||
                        tryGetModuleNameFromBaseUrl() ||
                        tryGetModuleNameFromRootDirs() ||
                        removeFileExtension(getRelativePath(moduleFileName, sourceDirectory));

                    function tryGetModuleNameFromAmbientModule(): string {
                        if (moduleSymbol.valueDeclaration.kind !== SyntaxKind.SourceFile) {
                            return moduleSymbol.name;
                        }
                    }

                    function tryGetModuleNameFromBaseUrl() {
                        if (!options.baseUrl) {
                            return undefined;
                        }

                        let relativeName = getRelativePathIfInDirectory(moduleFileName, options.baseUrl);
                        if (!relativeName) {
                            return undefined;
                        }

                        const relativeNameWithIndex = removeFileExtension(relativeName);
                        relativeName = removeExtensionAndIndexPostFix(relativeName);

                        if (options.paths) {
                            for (const key in options.paths) {
                                for (const pattern of options.paths[key]) {
                                    const indexOfStar = pattern.indexOf("*");
                                    if (indexOfStar === 0 && pattern.length === 1) {
                                        continue;
                                    }
                                    else if (indexOfStar !== -1) {
                                        const prefix = pattern.substr(0, indexOfStar);
                                        const suffix = pattern.substr(indexOfStar + 1);
                                        if (relativeName.length >= prefix.length + suffix.length &&
                                            startsWith(relativeName, prefix) &&
                                            endsWith(relativeName, suffix)) {
                                            const matchedStar = relativeName.substr(prefix.length, relativeName.length - suffix.length);
                                            return key.replace("\*", matchedStar);
                                        }
                                    }
                                    else if (pattern === relativeName || pattern === relativeNameWithIndex) {
                                        return key;
                                    }
                                }
                            }
                        }

                        return relativeName;
                    }

                    function tryGetModuleNameFromRootDirs() {
                        if (options.rootDirs) {
                            const normalizedTargetPath = getPathRelativeToRootDirs(moduleFileName, options.rootDirs);
                            const normalizedSourcePath = getPathRelativeToRootDirs(sourceDirectory, options.rootDirs);
                            if (normalizedTargetPath !== undefined) {
                                const relativePath = normalizedSourcePath !== undefined ? getRelativePath(normalizedTargetPath, normalizedSourcePath) : normalizedTargetPath;
                                return removeFileExtension(relativePath);
                            }
                        }
                        return undefined;
                    }

                    function tryGetModuleNameFromTypeRoots() {
                        const typeRoots = getEffectiveTypeRoots(options, context.host);
                        if (typeRoots) {
                            const normalizedTypeRoots = map(typeRoots, typeRoot => toPath(typeRoot, /*basePath*/ undefined, getCanonicalFileName));
                            for (const typeRoot of normalizedTypeRoots) {
                                if (startsWith(moduleFileName, typeRoot)) {
                                    const relativeFileName = moduleFileName.substring(typeRoot.length + 1);
                                    return removeExtensionAndIndexPostFix(relativeFileName);
                                }
                            }
                        }
                    }

                    function tryGetModuleNameAsNodeModule() {
                        if (getEmitModuleResolutionKind(options) !== ModuleResolutionKind.NodeJs) {
                            // nothing to do here
                            return undefined;
                        }

                        const indexOfNodeModules = moduleFileName.indexOf("node_modules");
                        if (indexOfNodeModules < 0) {
                            return undefined;
                        }

                        let relativeFileName: string;
                        if (sourceDirectory.indexOf(moduleFileName.substring(0, indexOfNodeModules - 1)) === 0) {
                            // if node_modules folder is in this folder or any of its parent folder, no need to keep it.
                            relativeFileName = moduleFileName.substring(indexOfNodeModules + 13 /* "node_modules\".length */);
                        }
                        else {
                            relativeFileName = getRelativePath(moduleFileName, sourceDirectory);
                        }

                        relativeFileName = removeFileExtension(relativeFileName);
                        if (endsWith(relativeFileName, "/index")) {
                            relativeFileName = getDirectoryPath(relativeFileName);
                        }
                        else {
                            try {
                                const moduleDirectory = getDirectoryPath(moduleFileName);
                                const packageJsonContent = JSON.parse(context.host.readFile(combinePaths(moduleDirectory, "package.json")));
                                if (packageJsonContent) {
                                    const mainFile = packageJsonContent.main || packageJsonContent.typings;
                                    if (mainFile) {
                                        const mainExportFile = toPath(mainFile, moduleDirectory, getCanonicalFileName);
                                        if (removeFileExtension(mainExportFile) === removeFileExtension(moduleFileName)) {
                                            relativeFileName = getDirectoryPath(relativeFileName);
                                        }
                                    }
                                }
                            }
                            catch (e) { }
                        }

                        return relativeFileName;
                    }
                }

                function getPathRelativeToRootDirs(path: string, rootDirs: string[]) {
                    for (const rootDir of rootDirs) {
                        const relativeName = getRelativePathIfInDirectory(path, rootDir);
                        if (relativeName !== undefined) {
                            return relativeName;
                        }
                    }
                    return undefined;
                }

                function removeExtensionAndIndexPostFix(fileName: string) {
                    fileName = removeFileExtension(fileName);
                    if (endsWith(fileName, "/index")) {
                        fileName = fileName.substr(0, fileName.length - 6/* "/index".length */);
                    }
                    return fileName;
                }

                function getRelativePathIfInDirectory(path: string, directoryPath: string) {
                    const relativePath = getRelativePathToDirectoryOrUrl(directoryPath, path, directoryPath, getCanonicalFileName, /*isAbsolutePathAnUrl*/ false);
                    return isRootedDiskPath(relativePath) || startsWith(relativePath, "..") ? undefined : relativePath;
                }

                function getRelativePath(path: string, directoryPath: string) {
                    const relativePath = getRelativePathToDirectoryOrUrl(directoryPath, path, directoryPath, getCanonicalFileName, /*isAbsolutePathAnUrl*/ false);
                    return moduleHasNonRelativeName(relativePath) ? "./" + relativePath : relativePath;
                }
            }

        }

        function createChangeTracker() {
            return textChanges.ChangeTracker.fromCodeFixContext(context);
        }

        function createCodeAction(
            description: DiagnosticMessage,
            diagnosticArgs: string[],
            changes: FileTextChanges[],
            kind: ImportCodeActionKind,
            moduleSpecifier?: string): ImportCodeAction {
            return {
                description: formatMessage.apply(undefined, [undefined, description].concat(<any[]>diagnosticArgs)),
                changes,
                kind,
                moduleSpecifier
            };
        }
    }
}
