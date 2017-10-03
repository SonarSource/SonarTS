namespace ts {
    export interface Node {
        getSourceFile(): SourceFile;
        getChildCount(sourceFile?: SourceFile): number;
        getChildAt(index: number, sourceFile?: SourceFile): Node;
        getChildren(sourceFile?: SourceFile): Node[];
        /* @internal */
        getChildren(sourceFile?: SourceFileLike): Node[];
        getStart(sourceFile?: SourceFile, includeJsDocComment?: boolean): number;
        /* @internal */
        getStart(sourceFile?: SourceFileLike, includeJsDocComment?: boolean): number;
        getFullStart(): number;
        getEnd(): number;
        getWidth(sourceFile?: SourceFile): number;
        getFullWidth(): number;
        getLeadingTriviaWidth(sourceFile?: SourceFile): number;
        getFullText(sourceFile?: SourceFile): string;
        getText(sourceFile?: SourceFile): string;
        getFirstToken(sourceFile?: SourceFile): Node;
        getLastToken(sourceFile?: SourceFile): Node;
        // See ts.forEachChild for documentation.
        forEachChild<T>(cbNode: (node: Node) => T, cbNodeArray?: (nodes: Node[]) => T): T;
    }

    export interface Symbol {
        getFlags(): SymbolFlags;
        getName(): string;
        getDeclarations(): Declaration[];
        getDocumentationComment(): SymbolDisplayPart[];
        getJsDocTags(): JSDocTagInfo[];
    }

    export interface Type {
        getFlags(): TypeFlags;
        getSymbol(): Symbol;
        getProperties(): Symbol[];
        getProperty(propertyName: string): Symbol;
        getApparentProperties(): Symbol[];
        getCallSignatures(): Signature[];
        getConstructSignatures(): Signature[];
        getStringIndexType(): Type;
        getNumberIndexType(): Type;
        getBaseTypes(): BaseType[];
        getNonNullableType(): Type;
    }

    export interface Signature {
        getDeclaration(): SignatureDeclaration;
        getTypeParameters(): TypeParameter[];
        getParameters(): Symbol[];
        getReturnType(): Type;
        getDocumentationComment(): SymbolDisplayPart[];
        getJsDocTags(): JSDocTagInfo[];
    }

    export interface SourceFile {
        /* @internal */ version: string;
        /* @internal */ scriptSnapshot: IScriptSnapshot;
        /* @internal */ nameTable: Map<number>;

        /* @internal */ getNamedDeclarations(): Map<Declaration[]>;

        getLineAndCharacterOfPosition(pos: number): LineAndCharacter;
        getLineEndOfPosition(pos: number): number;
        getLineStarts(): number[];
        getPositionOfLineAndCharacter(line: number, character: number): number;
        update(newText: string, textChangeRange: TextChangeRange): SourceFile;
    }

    export interface SourceFileLike {
        getLineAndCharacterOfPosition(pos: number): LineAndCharacter;
    }

    /**
     * Represents an immutable snapshot of a script at a specified time.Once acquired, the
     * snapshot is observably immutable. i.e. the same calls with the same parameters will return
     * the same values.
     */
    export interface IScriptSnapshot {
        /** Gets a portion of the script snapshot specified by [start, end). */
        getText(start: number, end: number): string;

        /** Gets the length of this script snapshot. */
        getLength(): number;

        /**
         * Gets the TextChangeRange that describe how the text changed between this text and
         * an older version.  This information is used by the incremental parser to determine
         * what sections of the script need to be re-parsed.  'undefined' can be returned if the
         * change range cannot be determined.  However, in that case, incremental parsing will
         * not happen and the entire document will be re - parsed.
         */
        getChangeRange(oldSnapshot: IScriptSnapshot): TextChangeRange | undefined;

        /** Releases all resources held by this script snapshot */
        dispose?(): void;
    }

    export namespace ScriptSnapshot {
        class StringScriptSnapshot implements IScriptSnapshot {

            constructor(private text: string) {
            }

            public getText(start: number, end: number): string {
                return start === 0 && end === this.text.length
                    ? this.text
                    : this.text.substring(start, end);
            }

            public getLength(): number {
                return this.text.length;
            }

            public getChangeRange(): TextChangeRange {
                // Text-based snapshots do not support incremental parsing. Return undefined
                // to signal that to the caller.
                return undefined;
            }
        }

        export function fromString(text: string): IScriptSnapshot {
            return new StringScriptSnapshot(text);
        }
    }
    export interface PreProcessedFileInfo {
        referencedFiles: FileReference[];
        typeReferenceDirectives: FileReference[];
        importedFiles: FileReference[];
        ambientExternalModules: string[];
        isLibFile: boolean;
    }

    export interface HostCancellationToken {
        isCancellationRequested(): boolean;
    }

    //
    // Public interface of the host of a language service instance.
    //
    export interface LanguageServiceHost {
        getCompilationSettings(): CompilerOptions;
        getNewLine?(): string;
        getProjectVersion?(): string;
        getScriptFileNames(): string[];
        getScriptKind?(fileName: string): ScriptKind;
        getScriptVersion(fileName: string): string;
        getScriptSnapshot(fileName: string): IScriptSnapshot | undefined;
        getLocalizedDiagnosticMessages?(): any;
        getCancellationToken?(): HostCancellationToken;
        getCurrentDirectory(): string;
        getDefaultLibFileName(options: CompilerOptions): string;
        log?(s: string): void;
        trace?(s: string): void;
        error?(s: string): void;
        useCaseSensitiveFileNames?(): boolean;

        /*
         * LS host can optionally implement these methods to support completions for module specifiers.
         * Without these methods, only completions for ambient modules will be provided.
         */
        readDirectory?(path: string, extensions?: string[], exclude?: string[], include?: string[]): string[];
        readFile?(path: string, encoding?: string): string;
        fileExists?(path: string): boolean;

        /*
         * LS host can optionally implement these methods to support automatic updating when new type libraries are installed
         */
        getTypeRootsVersion?(): number;

        /*
         * LS host can optionally implement this method if it wants to be completely in charge of module name resolution.
         * if implementation is omitted then language service will use built-in module resolution logic and get answers to
         * host specific questions using 'getScriptSnapshot'.
         */
        resolveModuleNames?(moduleNames: string[], containingFile: string): ResolvedModule[];
        resolveTypeReferenceDirectives?(typeDirectiveNames: string[], containingFile: string): ResolvedTypeReferenceDirective[];
        directoryExists?(directoryName: string): boolean;

        /*
         * getDirectories is also required for full import and type reference completions. Without it defined, certain
         * completions will not be provided
         */
        getDirectories?(directoryName: string): string[];

        /**
         * Gets a set of custom transformers to use during emit.
         */
        getCustomTransformers?(): CustomTransformers | undefined;
    }

    //
    // Public services of a language service instance associated
    // with a language service host instance
    //
    export interface LanguageService {
        cleanupSemanticCache(): void;

        getSyntacticDiagnostics(fileName: string): Diagnostic[];
        getSemanticDiagnostics(fileName: string): Diagnostic[];

        // TODO: Rename this to getProgramDiagnostics to better indicate that these are any
        // diagnostics present for the program level, and not just 'options' diagnostics.
        getCompilerOptionsDiagnostics(): Diagnostic[];

        /**
         * @deprecated Use getEncodedSyntacticClassifications instead.
         */
        getSyntacticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[];

        /**
         * @deprecated Use getEncodedSemanticClassifications instead.
         */
        getSemanticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[];

        // Encoded as triples of [start, length, ClassificationType].
        getEncodedSyntacticClassifications(fileName: string, span: TextSpan): Classifications;
        getEncodedSemanticClassifications(fileName: string, span: TextSpan): Classifications;

        getCompletionsAtPosition(fileName: string, position: number): CompletionInfo;
        getCompletionEntryDetails(fileName: string, position: number, entryName: string): CompletionEntryDetails;
        getCompletionEntrySymbol(fileName: string, position: number, entryName: string): Symbol;

        getQuickInfoAtPosition(fileName: string, position: number): QuickInfo;

        getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): TextSpan;

        getBreakpointStatementAtPosition(fileName: string, position: number): TextSpan;

        getSignatureHelpItems(fileName: string, position: number): SignatureHelpItems;

        getRenameInfo(fileName: string, position: number): RenameInfo;
        findRenameLocations(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): RenameLocation[];

        getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[];
        getTypeDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[];
        getImplementationAtPosition(fileName: string, position: number): ImplementationLocation[];

        getReferencesAtPosition(fileName: string, position: number): ReferenceEntry[];
        findReferences(fileName: string, position: number): ReferencedSymbol[];
        getDocumentHighlights(fileName: string, position: number, filesToSearch: string[]): DocumentHighlights[];

        /** @deprecated */
        getOccurrencesAtPosition(fileName: string, position: number): ReferenceEntry[];

        getNavigateToItems(searchValue: string, maxResultCount?: number, fileName?: string, excludeDtsFiles?: boolean): NavigateToItem[];
        getNavigationBarItems(fileName: string): NavigationBarItem[];
        getNavigationTree(fileName: string): NavigationTree;

        getOutliningSpans(fileName: string): OutliningSpan[];
        getTodoComments(fileName: string, descriptors: TodoCommentDescriptor[]): TodoComment[];
        getBraceMatchingAtPosition(fileName: string, position: number): TextSpan[];
        getIndentationAtPosition(fileName: string, position: number, options: EditorOptions | EditorSettings): number;

        getFormattingEditsForRange(fileName: string, start: number, end: number, options: FormatCodeOptions | FormatCodeSettings): TextChange[];
        getFormattingEditsForDocument(fileName: string, options: FormatCodeOptions | FormatCodeSettings): TextChange[];
        getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions | FormatCodeSettings): TextChange[];

        getDocCommentTemplateAtPosition(fileName: string, position: number): TextInsertion;

        isValidBraceCompletionAtPosition(fileName: string, position: number, openingBrace: number): boolean;

        getCodeFixesAtPosition(fileName: string, start: number, end: number, errorCodes: number[], formatOptions: FormatCodeSettings): CodeAction[];

        getEmitOutput(fileName: string, emitOnlyDtsFiles?: boolean): EmitOutput;

        getProgram(): Program;

        /* @internal */ getNonBoundSourceFile(fileName: string): SourceFile;

        /**
         * @internal
         * @deprecated Use ts.createSourceFile instead.
         */
        getSourceFile(fileName: string): SourceFile;

        dispose(): void;
    }

    export interface Classifications {
        spans: number[];
        endOfLineState: EndOfLineState;
    }

    export interface ClassifiedSpan {
        textSpan: TextSpan;
        classificationType: string; // ClassificationTypeNames
    }

    /**
     * Navigation bar interface designed for visual studio's dual-column layout.
     * This does not form a proper tree.
     * The navbar is returned as a list of top-level items, each of which has a list of child items.
     * Child items always have an empty array for their `childItems`.
     */
    export interface NavigationBarItem {
        text: string;
        kind: string;
        kindModifiers: string;
        spans: TextSpan[];
        childItems: NavigationBarItem[];
        indent: number;
        bolded: boolean;
        grayed: boolean;
    }

    /**
     * Node in a tree of nested declarations in a file.
     * The top node is always a script or module node.
     */
    export interface NavigationTree {
        /** Name of the declaration, or a short description, e.g. "<class>". */
        text: string;
        /** A ScriptElementKind */
        kind: string;
        /** ScriptElementKindModifier separated by commas, e.g. "public,abstract" */
        kindModifiers: string;
        /**
         * Spans of the nodes that generated this declaration.
         * There will be more than one if this is the result of merging.
         */
        spans: TextSpan[];
        /** Present if non-empty */
        childItems?: NavigationTree[];
    }

    export interface TodoCommentDescriptor {
        text: string;
        priority: number;
    }

    export interface TodoComment {
        descriptor: TodoCommentDescriptor;
        message: string;
        position: number;
    }

    export class TextChange {
        span: TextSpan;
        newText: string;
    }

    export interface FileTextChanges {
        fileName: string;
        textChanges: TextChange[];
    }

    export interface CodeAction {
        /** Description of the code action to display in the UI of the editor */
        description: string;
        /** Text changes to apply to each file as part of the code action */
        changes: FileTextChanges[];
    }

    export interface TextInsertion {
        newText: string;
        /** The position in newText the caret should point to after the insertion. */
        caretOffset: number;
    }

    export interface DocumentSpan {
        textSpan: TextSpan;
        fileName: string;
    }

    export interface RenameLocation extends DocumentSpan {
    }

    export interface ReferenceEntry extends DocumentSpan {
        isWriteAccess: boolean;
        isDefinition: boolean;
        isInString?: true;
    }

    export interface ImplementationLocation extends DocumentSpan {
        kind: string;
        displayParts: SymbolDisplayPart[];
    }

    export interface DocumentHighlights {
        fileName: string;
        highlightSpans: HighlightSpan[];
    }

    export namespace HighlightSpanKind {
        export const none = "none";
        export const definition = "definition";
        export const reference = "reference";
        export const writtenReference = "writtenReference";
    }

    export interface HighlightSpan {
        fileName?: string;
        isInString?: true;
        textSpan: TextSpan;
        kind: string;
    }

    export interface NavigateToItem {
        name: string;
        kind: string;
        kindModifiers: string;
        matchKind: string;
        isCaseSensitive: boolean;
        fileName: string;
        textSpan: TextSpan;
        containerName: string;
        containerKind: string;
    }

    export enum IndentStyle {
        None = 0,
        Block = 1,
        Smart = 2,
    }

    /* @deprecated - consider using EditorSettings instead */
    export interface EditorOptions {
        BaseIndentSize?: number;
        IndentSize: number;
        TabSize: number;
        NewLineCharacter: string;
        ConvertTabsToSpaces: boolean;
        IndentStyle: IndentStyle;
    }

    export interface EditorSettings {
        baseIndentSize?: number;
        indentSize?: number;
        tabSize?: number;
        newLineCharacter?: string;
        convertTabsToSpaces?: boolean;
        indentStyle?: IndentStyle;
    }

    /* @deprecated - consider using FormatCodeSettings instead */
    export interface FormatCodeOptions extends EditorOptions {
        InsertSpaceAfterCommaDelimiter: boolean;
        InsertSpaceAfterSemicolonInForStatements: boolean;
        InsertSpaceBeforeAndAfterBinaryOperators: boolean;
        InsertSpaceAfterConstructor?: boolean;
        InsertSpaceAfterKeywordsInControlFlowStatements: boolean;
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBraces?: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces?: boolean;
        InsertSpaceAfterTypeAssertion?: boolean;
        InsertSpaceBeforeFunctionParenthesis?: boolean;
        PlaceOpenBraceOnNewLineForFunctions: boolean;
        PlaceOpenBraceOnNewLineForControlBlocks: boolean;
    }

    export interface FormatCodeSettings extends EditorSettings {
        insertSpaceAfterCommaDelimiter?: boolean;
        insertSpaceAfterSemicolonInForStatements?: boolean;
        insertSpaceBeforeAndAfterBinaryOperators?: boolean;
        insertSpaceAfterConstructor?: boolean;
        insertSpaceAfterKeywordsInControlFlowStatements?: boolean;
        insertSpaceAfterFunctionKeywordForAnonymousFunctions?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces?: boolean;
        insertSpaceAfterTypeAssertion?: boolean;
        insertSpaceBeforeFunctionParenthesis?: boolean;
        placeOpenBraceOnNewLineForFunctions?: boolean;
        placeOpenBraceOnNewLineForControlBlocks?: boolean;
    }

    export interface DefinitionInfo {
        fileName: string;
        textSpan: TextSpan;
        kind: string;
        name: string;
        containerKind: string;
        containerName: string;
    }

    export interface ReferencedSymbolDefinitionInfo extends DefinitionInfo {
        displayParts: SymbolDisplayPart[];
    }

    export interface ReferencedSymbol {
        definition: ReferencedSymbolDefinitionInfo;
        references: ReferenceEntry[];
    }

    export enum SymbolDisplayPartKind {
        aliasName,
        className,
        enumName,
        fieldName,
        interfaceName,
        keyword,
        lineBreak,
        numericLiteral,
        stringLiteral,
        localName,
        methodName,
        moduleName,
        operator,
        parameterName,
        propertyName,
        punctuation,
        space,
        text,
        typeParameterName,
        enumMemberName,
        functionName,
        regularExpressionLiteral,
    }

    export interface SymbolDisplayPart {
        text: string;
        kind: string; // A ScriptElementKind
    }

    export interface JSDocTagInfo {
        name: string;
        text?: string;
    }

    export interface QuickInfo {
        kind: string;
        kindModifiers: string;
        textSpan: TextSpan;
        displayParts: SymbolDisplayPart[];
        documentation: SymbolDisplayPart[];
        tags: JSDocTagInfo[];
    }

    export interface RenameInfo {
        canRename: boolean;
        localizedErrorMessage: string;
        displayName: string;
        fullDisplayName: string;
        kind: string;
        kindModifiers: string;
        triggerSpan: TextSpan;
    }

    export interface SignatureHelpParameter {
        name: string;
        documentation: SymbolDisplayPart[];
        displayParts: SymbolDisplayPart[];
        isOptional: boolean;
    }

    /**
     * Represents a single signature to show in signature help.
     * The id is used for subsequent calls into the language service to ask questions about the
     * signature help item in the context of any documents that have been updated.  i.e. after
     * an edit has happened, while signature help is still active, the host can ask important
     * questions like 'what parameter is the user currently contained within?'.
     */
    export interface SignatureHelpItem {
        isVariadic: boolean;
        prefixDisplayParts: SymbolDisplayPart[];
        suffixDisplayParts: SymbolDisplayPart[];
        separatorDisplayParts: SymbolDisplayPart[];
        parameters: SignatureHelpParameter[];
        documentation: SymbolDisplayPart[];
        tags: JSDocTagInfo[];
    }

    /**
     * Represents a set of signature help items, and the preferred item that should be selected.
     */
    export interface SignatureHelpItems {
        items: SignatureHelpItem[];
        applicableSpan: TextSpan;
        selectedItemIndex: number;
        argumentIndex: number;
        argumentCount: number;
    }

    export interface CompletionInfo {
        isGlobalCompletion: boolean;
        isMemberCompletion: boolean;

        /**
         * true when the current location also allows for a new identifier
         */
        isNewIdentifierLocation: boolean;
        entries: CompletionEntry[];
    }

    export interface CompletionEntry {
        name: string;
        kind: string;            // see ScriptElementKind
        kindModifiers: string;   // see ScriptElementKindModifier, comma separated
        sortText: string;
        /**
         * An optional span that indicates the text to be replaced by this completion item. It will be
         * set if the required span differs from the one generated by the default replacement behavior and should
         * be used in that case
         */
        replacementSpan?: TextSpan;
    }

    export interface CompletionEntryDetails {
        name: string;
        kind: string;            // see ScriptElementKind
        kindModifiers: string;   // see ScriptElementKindModifier, comma separated
        displayParts: SymbolDisplayPart[];
        documentation: SymbolDisplayPart[];
        tags: JSDocTagInfo[];
    }

    export interface OutliningSpan {
        /** The span of the document to actually collapse. */
        textSpan: TextSpan;

        /** The span of the document to display when the user hovers over the collapsed span. */
        hintSpan: TextSpan;

        /** The text to display in the editor for the collapsed region. */
        bannerText: string;

        /**
         * Whether or not this region should be automatically collapsed when
         * the 'Collapse to Definitions' command is invoked.
         */
        autoCollapse: boolean;
    }

    export interface EmitOutput {
        outputFiles: OutputFile[];
        emitSkipped: boolean;
    }

    export const enum OutputFileType {
        JavaScript,
        SourceMap,
        Declaration
    }

    export interface OutputFile {
        name: string;
        writeByteOrderMark: boolean;
        text: string;
    }

    export const enum EndOfLineState {
        None,
        InMultiLineCommentTrivia,
        InSingleQuoteStringLiteral,
        InDoubleQuoteStringLiteral,
        InTemplateHeadOrNoSubstitutionTemplate,
        InTemplateMiddleOrTail,
        InTemplateSubstitutionPosition,
    }

    export enum TokenClass {
        Punctuation,
        Keyword,
        Operator,
        Comment,
        Whitespace,
        Identifier,
        NumberLiteral,
        StringLiteral,
        RegExpLiteral,
    }

    export interface ClassificationResult {
        finalLexState: EndOfLineState;
        entries: ClassificationInfo[];
    }

    export interface ClassificationInfo {
        length: number;
        classification: TokenClass;
    }

    export interface Classifier {
        /**
         * Gives lexical classifications of tokens on a line without any syntactic context.
         * For instance, a token consisting of the text 'string' can be either an identifier
         * named 'string' or the keyword 'string', however, because this classifier is not aware,
         * it relies on certain heuristics to give acceptable results. For classifications where
         * speed trumps accuracy, this function is preferable; however, for true accuracy, the
         * syntactic classifier is ideal. In fact, in certain editing scenarios, combining the
         * lexical, syntactic, and semantic classifiers may issue the best user experience.
         *
         * @param text                      The text of a line to classify.
         * @param lexState                  The state of the lexical classifier at the end of the previous line.
         * @param syntacticClassifierAbsent Whether the client is *not* using a syntactic classifier.
         *                                  If there is no syntactic classifier (syntacticClassifierAbsent=true),
         *                                  certain heuristics may be used in its place; however, if there is a
         *                                  syntactic classifier (syntacticClassifierAbsent=false), certain
         *                                  classifications which may be incorrectly categorized will be given
         *                                  back as Identifiers in order to allow the syntactic classifier to
         *                                  subsume the classification.
         * @deprecated Use getLexicalClassifications instead.
         */
        getClassificationsForLine(text: string, lexState: EndOfLineState, syntacticClassifierAbsent: boolean): ClassificationResult;
        getEncodedLexicalClassifications(text: string, endOfLineState: EndOfLineState, syntacticClassifierAbsent: boolean): Classifications;
    }

    // TODO: move these to enums
    export namespace ScriptElementKind {
        export const unknown = "";
        export const warning = "warning";

        /** predefined type (void) or keyword (class) */
        export const keyword = "keyword";

        /** top level script node */
        export const scriptElement = "script";

        /** module foo {} */
        export const moduleElement = "module";

        /** class X {} */
        export const classElement = "class";

        /** var x = class X {} */
        export const localClassElement = "local class";

        /** interface Y {} */
        export const interfaceElement = "interface";

        /** type T = ... */
        export const typeElement = "type";

        /** enum E */
        export const enumElement = "enum";
        export const enumMemberElement = "enum member";

        /**
         * Inside module and script only
         * const v = ..
         */
        export const variableElement = "var";

        /** Inside function */
        export const localVariableElement = "local var";

        /**
         * Inside module and script only
         * function f() { }
         */
        export const functionElement = "function";

        /** Inside function */
        export const localFunctionElement = "local function";

        /** class X { [public|private]* foo() {} } */
        export const memberFunctionElement = "method";

        /** class X { [public|private]* [get|set] foo:number; } */
        export const memberGetAccessorElement = "getter";
        export const memberSetAccessorElement = "setter";

        /**
         * class X { [public|private]* foo:number; }
         * interface Y { foo:number; }
         */
        export const memberVariableElement = "property";

        /** class X { constructor() { } } */
        export const constructorImplementationElement = "constructor";

        /** interface Y { ():number; } */
        export const callSignatureElement = "call";

        /** interface Y { []:number; } */
        export const indexSignatureElement = "index";

        /** interface Y { new():Y; } */
        export const constructSignatureElement = "construct";

        /** function foo(*Y*: string) */
        export const parameterElement = "parameter";

        export const typeParameterElement = "type parameter";

        export const primitiveType = "primitive type";

        export const label = "label";

        export const alias = "alias";

        export const constElement = "const";

        export const letElement = "let";

        export const directory = "directory";

        export const externalModuleName = "external module name";

        /**
         * <JsxTagName attribute1 attribute2={0} />
         */
        export const jsxAttribute = "JSX attribute";
    }

    export namespace ScriptElementKindModifier {
        export const none = "";
        export const publicMemberModifier = "public";
        export const privateMemberModifier = "private";
        export const protectedMemberModifier = "protected";
        export const exportedModifier = "export";
        export const ambientModifier = "declare";
        export const staticModifier = "static";
        export const abstractModifier = "abstract";
    }

    export class ClassificationTypeNames {
        public static comment = "comment";
        public static identifier = "identifier";
        public static keyword = "keyword";
        public static numericLiteral = "number";
        public static operator = "operator";
        public static stringLiteral = "string";
        public static whiteSpace = "whitespace";
        public static text = "text";

        public static punctuation = "punctuation";

        public static className = "class name";
        public static enumName = "enum name";
        public static interfaceName = "interface name";
        public static moduleName = "module name";
        public static typeParameterName = "type parameter name";
        public static typeAliasName = "type alias name";
        public static parameterName = "parameter name";
        public static docCommentTagName = "doc comment tag name";
        public static jsxOpenTagName = "jsx open tag name";
        public static jsxCloseTagName = "jsx close tag name";
        public static jsxSelfClosingTagName = "jsx self closing tag name";
        public static jsxAttribute = "jsx attribute";
        public static jsxText = "jsx text";
        public static jsxAttributeStringLiteralValue = "jsx attribute string literal value";
    }

    export const enum ClassificationType {
        comment = 1,
        identifier = 2,
        keyword = 3,
        numericLiteral = 4,
        operator = 5,
        stringLiteral = 6,
        regularExpressionLiteral = 7,
        whiteSpace = 8,
        text = 9,
        punctuation = 10,
        className = 11,
        enumName = 12,
        interfaceName = 13,
        moduleName = 14,
        typeParameterName = 15,
        typeAliasName = 16,
        parameterName = 17,
        docCommentTagName = 18,
        jsxOpenTagName = 19,
        jsxCloseTagName = 20,
        jsxSelfClosingTagName = 21,
        jsxAttribute = 22,
        jsxText = 23,
        jsxAttributeStringLiteralValue = 24,
    }
}
