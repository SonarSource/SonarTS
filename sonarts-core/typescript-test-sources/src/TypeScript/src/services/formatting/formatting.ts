///<reference path='..\services.ts' />
///<reference path='formattingScanner.ts' />
///<reference path='rulesProvider.ts' />
///<reference path='references.ts' />

/* @internal */
namespace ts.formatting {

    export interface TextRangeWithKind extends TextRange {
        kind: SyntaxKind;
    }

    export interface TokenInfo {
        leadingTrivia: TextRangeWithKind[];
        token: TextRangeWithKind;
        trailingTrivia: TextRangeWithKind[];
    }

    const enum Constants {
        Unknown = -1
    }

    /*
     * Indentation for the scope that can be dynamically recomputed.
     * i.e
     * while(true)
     * { let x;
     * }
     * Normally indentation is applied only to the first token in line so at glance 'let' should not be touched.
     * However if some format rule adds new line between '}' and 'let' 'let' will become
     * the first token in line so it should be indented
     */
    interface DynamicIndentation {
        getIndentationForToken(tokenLine: number, tokenKind: SyntaxKind, container: Node): number;
        getIndentationForComment(owningToken: SyntaxKind, tokenIndentation: number, container: Node): number;
        /**
         * Indentation for open and close tokens of the node if it is block or another node that needs special indentation
         * ... {
         * .........<child>
         * ....}
         *  ____ - indentation
         *      ____ - delta
         */
        getIndentation(): number;
        /**
         * Prefered relative indentation for child nodes.
         * Delta is used to carry the indentation info
         * foo(bar({
         *     $
         * }))
         * Both 'foo', 'bar' introduce new indentation with delta = 4, but total indentation in $ is not 8.
         * foo: { indentation: 0, delta: 4 }
         * bar: { indentation: foo.indentation + foo.delta = 4, delta: 4} however 'foo' and 'bar' are on the same line
         * so bar inherits indentation from foo and bar.delta will be 4
         *
         */
        getDelta(child: TextRangeWithKind): number;
        /**
         * Formatter calls this function when rule adds or deletes new lines from the text
         * so indentation scope can adjust values of indentation and delta.
         */
        recomputeIndentation(lineAddedByFormatting: boolean): void;
    }

    interface Indentation {
        indentation: number;
        delta: number;
    }

    export function formatOnEnter(position: number, sourceFile: SourceFile, rulesProvider: RulesProvider, options: FormatCodeSettings): TextChange[] {
        const line = sourceFile.getLineAndCharacterOfPosition(position).line;
        if (line === 0) {
            return [];
        }
        // After the enter key, the cursor is now at a new line. The new line may or may not contain non-whitespace characters.
        // If the new line has only whitespaces, we won't want to format this line, because that would remove the indentation as
        // trailing whitespaces. So the end of the formatting span should be the later one between:
        //  1. the end of the previous line
        //  2. the last non-whitespace character in the current line
        let endOfFormatSpan = getEndLinePosition(line, sourceFile);
        while (isWhiteSpaceSingleLine(sourceFile.text.charCodeAt(endOfFormatSpan))) {
            endOfFormatSpan--;
        }
        // if the character at the end of the span is a line break, we shouldn't include it, because it indicates we don't want to
        // touch the current line at all. Also, on some OSes the line break consists of two characters (\r\n), we should test if the
        // previous character before the end of format span is line break character as well.
        if (isLineBreak(sourceFile.text.charCodeAt(endOfFormatSpan))) {
            endOfFormatSpan--;
        }
        const span = {
            // get start position for the previous line
            pos: getStartPositionOfLine(line - 1, sourceFile),
            // end value is exclusive so add 1 to the result
            end: endOfFormatSpan + 1
        };
        return formatSpan(span, sourceFile, options, rulesProvider, FormattingRequestKind.FormatOnEnter);
    }

    export function formatOnSemicolon(position: number, sourceFile: SourceFile, rulesProvider: RulesProvider, options: FormatCodeSettings): TextChange[] {
        return formatOutermostParent(position, SyntaxKind.SemicolonToken, sourceFile, options, rulesProvider, FormattingRequestKind.FormatOnSemicolon);
    }

    export function formatOnClosingCurly(position: number, sourceFile: SourceFile, rulesProvider: RulesProvider, options: FormatCodeSettings): TextChange[] {
        return formatOutermostParent(position, SyntaxKind.CloseBraceToken, sourceFile, options, rulesProvider, FormattingRequestKind.FormatOnClosingCurlyBrace);
    }

    export function formatDocument(sourceFile: SourceFile, rulesProvider: RulesProvider, options: FormatCodeSettings): TextChange[] {
        const span = {
            pos: 0,
            end: sourceFile.text.length
        };
        return formatSpan(span, sourceFile, options, rulesProvider, FormattingRequestKind.FormatDocument);
    }

    export function formatSelection(start: number, end: number, sourceFile: SourceFile, rulesProvider: RulesProvider, options: FormatCodeSettings): TextChange[] {
        // format from the beginning of the line
        const span = {
            pos: getLineStartPositionForPosition(start, sourceFile),
            end: end
        };
        return formatSpan(span, sourceFile, options, rulesProvider, FormattingRequestKind.FormatSelection);
    }

    function formatOutermostParent(position: number, expectedLastToken: SyntaxKind, sourceFile: SourceFile, options: FormatCodeSettings, rulesProvider: RulesProvider, requestKind: FormattingRequestKind): TextChange[] {
        const parent = findOutermostParent(position, expectedLastToken, sourceFile);
        if (!parent) {
            return [];
        }
        const span = {
            pos: getLineStartPositionForPosition(parent.getStart(sourceFile), sourceFile),
            end: parent.end
        };
        return formatSpan(span, sourceFile, options, rulesProvider, requestKind);
    }

    function findOutermostParent(position: number, expectedTokenKind: SyntaxKind, sourceFile: SourceFile): Node {
        const precedingToken = findPrecedingToken(position, sourceFile);

        // when it is claimed that trigger character was typed at given position
        // we verify that there is a token with a matching kind whose end is equal to position (because the character was just typed).
        // If this condition is not hold - then trigger character was typed in some other context,
        // i.e.in comment and thus should not trigger autoformatting
        if (!precedingToken ||
            precedingToken.kind !== expectedTokenKind ||
            position !== precedingToken.getEnd()) {
            return undefined;
        }

        // walk up and search for the parent node that ends at the same position with precedingToken.
        // for cases like this
        //
        // let x = 1;
        // while (true) {
        // }
        // after typing close curly in while statement we want to reformat just the while statement.
        // However if we just walk upwards searching for the parent that has the same end value -
        // we'll end up with the whole source file. isListElement allows to stop on the list element level
        let current = precedingToken;
        while (current &&
            current.parent &&
            current.parent.end === precedingToken.end &&
            !isListElement(current.parent, current)) {
            current = current.parent;
        }

        return current;
    }

    // Returns true if node is a element in some list in parent
    // i.e. parent is class declaration with the list of members and node is one of members.
    function isListElement(parent: Node, node: Node): boolean {
        switch (parent.kind) {
            case SyntaxKind.ClassDeclaration:
            case SyntaxKind.InterfaceDeclaration:
                return rangeContainsRange((<InterfaceDeclaration>parent).members, node);
            case SyntaxKind.ModuleDeclaration:
                const body = (<ModuleDeclaration>parent).body;
                return body && body.kind === SyntaxKind.ModuleBlock && rangeContainsRange((<ModuleBlock>body).statements, node);
            case SyntaxKind.SourceFile:
            case SyntaxKind.Block:
            case SyntaxKind.ModuleBlock:
                return rangeContainsRange((<Block>parent).statements, node);
            case SyntaxKind.CatchClause:
                return rangeContainsRange((<CatchClause>parent).block.statements, node);
        }

        return false;
    }

    /** find node that fully contains given text range */
    function findEnclosingNode(range: TextRange, sourceFile: SourceFile): Node {
        return find(sourceFile);

        function find(n: Node): Node {
            const candidate = forEachChild(n, c => startEndContainsRange(c.getStart(sourceFile), c.end, range) && c);
            if (candidate) {
                const result = find(candidate);
                if (result) {
                    return result;
                }
            }

            return n;
        }
    }

    /** formatting is not applied to ranges that contain parse errors.
     * This function will return a predicate that for a given text range will tell
     * if there are any parse errors that overlap with the range.
     */
    function prepareRangeContainsErrorFunction(errors: Diagnostic[], originalRange: TextRange): (r: TextRange) => boolean {
        if (!errors.length) {
            return rangeHasNoErrors;
        }

        // pick only errors that fall in range
        const sorted = errors
            .filter(d => rangeOverlapsWithStartEnd(originalRange, d.start, d.start + d.length))
            .sort((e1, e2) => e1.start - e2.start);

        if (!sorted.length) {
            return rangeHasNoErrors;
        }

        let index = 0;

        return r => {
            // in current implementation sequence of arguments [r1, r2...] is monotonically increasing.
            // 'index' tracks the index of the most recent error that was checked.
            while (true) {
                if (index >= sorted.length) {
                    // all errors in the range were already checked -> no error in specified range
                    return false;
                }

                const error = sorted[index];
                if (r.end <= error.start) {
                    // specified range ends before the error refered by 'index' - no error in range
                    return false;
                }

                if (startEndOverlapsWithStartEnd(r.pos, r.end, error.start, error.start + error.length)) {
                    // specified range overlaps with error range
                    return true;
                }

                index++;
            }
        };

        function rangeHasNoErrors(): boolean {
            return false;
        }
    }

    /**
     * Start of the original range might fall inside the comment - scanner will not yield appropriate results
     * This function will look for token that is located before the start of target range
     * and return its end as start position for the scanner.
     */
    function getScanStartPosition(enclosingNode: Node, originalRange: TextRange, sourceFile: SourceFile): number {
        const start = enclosingNode.getStart(sourceFile);
        if (start === originalRange.pos && enclosingNode.end === originalRange.end) {
            return start;
        }

        const precedingToken = findPrecedingToken(originalRange.pos, sourceFile);
        if (!precedingToken) {
            // no preceding token found - start from the beginning of enclosing node
            return enclosingNode.pos;
        }

        // preceding token ends after the start of original range (i.e when originalRange.pos falls in the middle of literal)
        // start from the beginning of enclosingNode to handle the entire 'originalRange'
        if (precedingToken.end >= originalRange.pos) {
            return enclosingNode.pos;
        }

        return precedingToken.end;
    }

    /*
     * For cases like
     * if (a ||
     *     b ||$
     *     c) {...}
     * If we hit Enter at $ we want line '    b ||' to be indented.
     * Formatting will be applied to the last two lines.
     * Node that fully encloses these lines is binary expression 'a ||...'.
     * Initial indentation for this node will be 0.
     * Binary expressions don't introduce new indentation scopes, however it is possible
     * that some parent node on the same line does - like if statement in this case.
     * Note that we are considering parents only from the same line with initial node -
     * if parent is on the different line - its delta was already contributed
     * to the initial indentation.
     */
    function getOwnOrInheritedDelta(n: Node, options: FormatCodeSettings, sourceFile: SourceFile): number {
        let previousLine = Constants.Unknown;
        let child: Node;
        while (n) {
            const line = sourceFile.getLineAndCharacterOfPosition(n.getStart(sourceFile)).line;
            if (previousLine !== Constants.Unknown && line !== previousLine) {
                break;
            }

            if (SmartIndenter.shouldIndentChildNode(n, child)) {
                return options.indentSize;
            }

            previousLine = line;
            child = n;
            n = n.parent;
        }
        return 0;
    }

    /* @internal */
    export function formatNode(node: Node, sourceFileLike: SourceFileLike, languageVariant: LanguageVariant, initialIndentation: number, delta: number,  rulesProvider: RulesProvider): TextChange[] {
        const range = { pos: 0, end: sourceFileLike.text.length };
        return formatSpanWorker(
            range,
            node,
            initialIndentation,
            delta,
            getFormattingScanner(sourceFileLike.text, languageVariant, range.pos, range.end),
            rulesProvider.getFormatOptions(),
            rulesProvider,
            FormattingRequestKind.FormatSelection,
            _ => false, // assume that node does not have any errors
            sourceFileLike);
    }

    function formatSpan(originalRange: TextRange,
        sourceFile: SourceFile,
        options: FormatCodeSettings,
        rulesProvider: RulesProvider,
        requestKind: FormattingRequestKind): TextChange[] {
        // find the smallest node that fully wraps the range and compute the initial indentation for the node
        const enclosingNode = findEnclosingNode(originalRange, sourceFile);
        return formatSpanWorker(
            originalRange,
            enclosingNode,
            SmartIndenter.getIndentationForNode(enclosingNode, originalRange, sourceFile, options),
            getOwnOrInheritedDelta(enclosingNode, options, sourceFile),
            getFormattingScanner(sourceFile.text, sourceFile.languageVariant, getScanStartPosition(enclosingNode, originalRange, sourceFile), originalRange.end),
            options,
            rulesProvider,
            requestKind,
            prepareRangeContainsErrorFunction(sourceFile.parseDiagnostics, originalRange),
            sourceFile);
    }

    function formatSpanWorker(originalRange: TextRange,
        enclosingNode: Node,
        initialIndentation: number,
        delta: number,
        formattingScanner: FormattingScanner,
        options: FormatCodeSettings,
        rulesProvider: RulesProvider,
        requestKind: FormattingRequestKind,
        rangeContainsError: (r: TextRange) => boolean,
        sourceFile: SourceFileLike): TextChange[] {

        // formatting context is used by rules provider
        const formattingContext = new FormattingContext(sourceFile, requestKind, options);
        let previousRangeHasError: boolean;
        let previousRange: TextRangeWithKind;
        let previousParent: Node;
        let previousRangeStartLine: number;

        let lastIndentedLine: number;
        let indentationOnLastIndentedLine: number;

        const edits: TextChange[] = [];

        formattingScanner.advance();

        if (formattingScanner.isOnToken()) {
            const startLine = sourceFile.getLineAndCharacterOfPosition(enclosingNode.getStart(sourceFile)).line;
            let undecoratedStartLine = startLine;
            if (enclosingNode.decorators) {
                undecoratedStartLine = sourceFile.getLineAndCharacterOfPosition(getNonDecoratorTokenPosOfNode(enclosingNode, sourceFile)).line;
            }

            processNode(enclosingNode, enclosingNode, startLine, undecoratedStartLine, initialIndentation, delta);
        }

        if (!formattingScanner.isOnToken()) {
            const leadingTrivia = formattingScanner.getCurrentLeadingTrivia();
            if (leadingTrivia) {
                processTrivia(leadingTrivia, enclosingNode, enclosingNode, /*dynamicIndentation*/ undefined);
                trimTrailingWhitespacesForRemainingRange();
            }
        }

        formattingScanner.close();

        return edits;

        // local functions

        /** Tries to compute the indentation for a list element.
         * If list element is not in range then
         * function will pick its actual indentation
         * so it can be pushed downstream as inherited indentation.
         * If list element is in the range - its indentation will be equal
         * to inherited indentation from its predecessors.
         */
        function tryComputeIndentationForListItem(startPos: number,
            endPos: number,
            parentStartLine: number,
            range: TextRange,
            inheritedIndentation: number): number {

            if (rangeOverlapsWithStartEnd(range, startPos, endPos) ||
                rangeContainsStartEnd(range, startPos, endPos) /* Not to miss zero-range nodes e.g. JsxText */) {

                if (inheritedIndentation !== Constants.Unknown) {
                    return inheritedIndentation;
                }
            }
            else {
                const startLine = sourceFile.getLineAndCharacterOfPosition(startPos).line;
                const startLinePosition = getLineStartPositionForPosition(startPos, sourceFile);
                const column = SmartIndenter.findFirstNonWhitespaceColumn(startLinePosition, startPos, sourceFile, options);
                if (startLine !== parentStartLine || startPos === column) {
                    // Use the base indent size if it is greater than
                    // the indentation of the inherited predecessor.
                    const baseIndentSize = SmartIndenter.getBaseIndentation(options);
                    return baseIndentSize > column ? baseIndentSize : column;
                }
            }

            return Constants.Unknown;
        }

        function computeIndentation(
            node: TextRangeWithKind,
            startLine: number,
            inheritedIndentation: number,
            parent: Node,
            parentDynamicIndentation: DynamicIndentation,
            effectiveParentStartLine: number): Indentation {

            let indentation = inheritedIndentation;
            let delta = SmartIndenter.shouldIndentChildNode(node) ? options.indentSize : 0;

            if (effectiveParentStartLine === startLine) {
                // if node is located on the same line with the parent
                // - inherit indentation from the parent
                // - push children if either parent of node itself has non-zero delta
                indentation = startLine === lastIndentedLine
                    ? indentationOnLastIndentedLine
                    : parentDynamicIndentation.getIndentation();
                delta = Math.min(options.indentSize, parentDynamicIndentation.getDelta(node) + delta);
            }
            else if (indentation === Constants.Unknown) {
                if (SmartIndenter.childStartsOnTheSameLineWithElseInIfStatement(parent, node, startLine, sourceFile)) {
                    indentation = parentDynamicIndentation.getIndentation();
                }
                else {
                    indentation = parentDynamicIndentation.getIndentation() + parentDynamicIndentation.getDelta(node);
                }
            }

            return {
                indentation,
                delta
            };
        }

        function getFirstNonDecoratorTokenOfNode(node: Node) {
            if (node.modifiers && node.modifiers.length) {
                return node.modifiers[0].kind;
            }
            switch (node.kind) {
                case SyntaxKind.ClassDeclaration: return SyntaxKind.ClassKeyword;
                case SyntaxKind.InterfaceDeclaration: return SyntaxKind.InterfaceKeyword;
                case SyntaxKind.FunctionDeclaration: return SyntaxKind.FunctionKeyword;
                case SyntaxKind.EnumDeclaration: return SyntaxKind.EnumDeclaration;
                case SyntaxKind.GetAccessor: return SyntaxKind.GetKeyword;
                case SyntaxKind.SetAccessor: return SyntaxKind.SetKeyword;
                case SyntaxKind.MethodDeclaration:
                    if ((<MethodDeclaration>node).asteriskToken) {
                        return SyntaxKind.AsteriskToken;
                    }
                    // falls through
                case SyntaxKind.PropertyDeclaration:
                case SyntaxKind.Parameter:
                    return getNameOfDeclaration(<Declaration>node).kind;
            }
        }

        function getDynamicIndentation(node: Node, nodeStartLine: number, indentation: number, delta: number): DynamicIndentation {
            return {
                getIndentationForComment: (kind, tokenIndentation, container) => {
                    switch (kind) {
                        // preceding comment to the token that closes the indentation scope inherits the indentation from the scope
                        // ..  {
                        //     // comment
                        // }
                        case SyntaxKind.CloseBraceToken:
                        case SyntaxKind.CloseBracketToken:
                        case SyntaxKind.CloseParenToken:
                            return indentation + getEffectiveDelta(delta, container);
                    }
                    return tokenIndentation !== Constants.Unknown ? tokenIndentation : indentation;
                },
                getIndentationForToken: (line, kind, container) => {
                    if (nodeStartLine !== line && node.decorators) {
                        if (kind === getFirstNonDecoratorTokenOfNode(node)) {
                            // if this token is the first token following the list of decorators, we do not need to indent
                            return indentation;
                        }
                    }
                    switch (kind) {
                        // open and close brace, 'else' and 'while' (in do statement) tokens has indentation of the parent
                        case SyntaxKind.OpenBraceToken:
                        case SyntaxKind.CloseBraceToken:
                        case SyntaxKind.OpenParenToken:
                        case SyntaxKind.CloseParenToken:
                        case SyntaxKind.ElseKeyword:
                        case SyntaxKind.WhileKeyword:
                        case SyntaxKind.AtToken:
                            return indentation;
                        case SyntaxKind.SlashToken:
                        case SyntaxKind.GreaterThanToken: {
                            if (container.kind === SyntaxKind.JsxOpeningElement ||
                                container.kind === SyntaxKind.JsxClosingElement ||
                                container.kind === SyntaxKind.JsxSelfClosingElement
                            ) {
                                return indentation;
                            }
                            break;
                        }
                        case SyntaxKind.OpenBracketToken:
                        case SyntaxKind.CloseBracketToken: {
                            if (container.kind !== SyntaxKind.MappedType) {
                                return indentation;
                            }
                            break;
                        }
                    }
                    // if token line equals to the line of containing node (this is a first token in the node) - use node indentation
                    return nodeStartLine !== line ? indentation + getEffectiveDelta(delta, container) : indentation;
                },
                getIndentation: () => indentation,
                getDelta: child => getEffectiveDelta(delta, child),
                recomputeIndentation: lineAdded => {
                    if (node.parent && SmartIndenter.shouldIndentChildNode(node.parent, node)) {
                        if (lineAdded) {
                            indentation += options.indentSize;
                        }
                        else {
                            indentation -= options.indentSize;
                        }

                        if (SmartIndenter.shouldIndentChildNode(node)) {
                            delta = options.indentSize;
                        }
                        else {
                            delta = 0;
                        }
                    }
                }
            };

            function getEffectiveDelta(delta: number, child: TextRangeWithKind) {
                // Delta value should be zero when the node explicitly prevents indentation of the child node
                return SmartIndenter.nodeWillIndentChild(node, child, /*indentByDefault*/ true) ? delta : 0;
            }
        }

        function processNode(node: Node, contextNode: Node, nodeStartLine: number, undecoratedNodeStartLine: number, indentation: number, delta: number) {
            if (!rangeOverlapsWithStartEnd(originalRange, node.getStart(sourceFile), node.getEnd())) {
                return;
            }

            const nodeDynamicIndentation = getDynamicIndentation(node, nodeStartLine, indentation, delta);

            // a useful observations when tracking context node
            //        /
            //      [a]
            //   /   |   \
            //  [b] [c] [d]
            // node 'a' is a context node for nodes 'b', 'c', 'd'
            // except for the leftmost leaf token in [b] - in this case context node ('e') is located somewhere above 'a'
            // this rule can be applied recursively to child nodes of 'a'.
            //
            // context node is set to parent node value after processing every child node
            // context node is set to parent of the token after processing every token

            let childContextNode = contextNode;

            // if there are any tokens that logically belong to node and interleave child nodes
            // such tokens will be consumed in processChildNode for for the child that follows them
            forEachChild(
                node,
                child => {
                    processChildNode(child, /*inheritedIndentation*/ Constants.Unknown, node, nodeDynamicIndentation, nodeStartLine, undecoratedNodeStartLine, /*isListItem*/ false);
                },
                (nodes: NodeArray<Node>) => {
                    processChildNodes(nodes, node, nodeStartLine, nodeDynamicIndentation);
                });

            // proceed any tokens in the node that are located after child nodes
            while (formattingScanner.isOnToken()) {
                const tokenInfo = formattingScanner.readTokenInfo(node);
                if (tokenInfo.token.end > node.end) {
                    break;
                }
                consumeTokenAndAdvanceScanner(tokenInfo, node, nodeDynamicIndentation, node);
            }

            function processChildNode(
                child: Node,
                inheritedIndentation: number,
                parent: Node,
                parentDynamicIndentation: DynamicIndentation,
                parentStartLine: number,
                undecoratedParentStartLine: number,
                isListItem: boolean,
                isFirstListItem?: boolean): number {

                const childStartPos = child.getStart(sourceFile);

                const childStartLine = sourceFile.getLineAndCharacterOfPosition(childStartPos).line;

                let undecoratedChildStartLine = childStartLine;
                if (child.decorators) {
                    undecoratedChildStartLine = sourceFile.getLineAndCharacterOfPosition(getNonDecoratorTokenPosOfNode(child, sourceFile)).line;
                }

                // if child is a list item - try to get its indentation
                let childIndentationAmount = Constants.Unknown;
                if (isListItem) {
                    childIndentationAmount = tryComputeIndentationForListItem(childStartPos, child.end, parentStartLine, originalRange, inheritedIndentation);
                    if (childIndentationAmount !== Constants.Unknown) {
                        inheritedIndentation = childIndentationAmount;
                    }
                }

                // child node is outside the target range - do not dive inside
                if (!rangeOverlapsWithStartEnd(originalRange, child.pos, child.end)) {
                    if (child.end < originalRange.pos) {
                        formattingScanner.skipToEndOf(child);
                    }
                    return inheritedIndentation;
                }

                if (child.getFullWidth() === 0) {
                    return inheritedIndentation;
                }

                while (formattingScanner.isOnToken()) {
                    // proceed any parent tokens that are located prior to child.getStart()
                    const tokenInfo = formattingScanner.readTokenInfo(node);
                    if (tokenInfo.token.end > childStartPos) {
                        // stop when formatting scanner advances past the beginning of the child
                        break;
                    }

                    consumeTokenAndAdvanceScanner(tokenInfo, node, parentDynamicIndentation, node);
                }

                if (!formattingScanner.isOnToken()) {
                    return inheritedIndentation;
                }

                // JSX text shouldn't affect indenting
                if (isToken(child) && child.kind !== SyntaxKind.JsxText) {
                    // if child node is a token, it does not impact indentation, proceed it using parent indentation scope rules
                    const tokenInfo = formattingScanner.readTokenInfo(child);
                    Debug.assert(tokenInfo.token.end === child.end, "Token end is child end");
                    consumeTokenAndAdvanceScanner(tokenInfo, node, parentDynamicIndentation, child);
                    return inheritedIndentation;
                }

                const effectiveParentStartLine = child.kind === SyntaxKind.Decorator ? childStartLine : undecoratedParentStartLine;
                const childIndentation = computeIndentation(child, childStartLine, childIndentationAmount, node, parentDynamicIndentation, effectiveParentStartLine);

                processNode(child, childContextNode, childStartLine, undecoratedChildStartLine, childIndentation.indentation, childIndentation.delta);

                childContextNode = node;

                if (isFirstListItem && parent.kind === SyntaxKind.ArrayLiteralExpression && inheritedIndentation === Constants.Unknown) {
                    inheritedIndentation = childIndentation.indentation;
                }

                return inheritedIndentation;
            }

            function processChildNodes(nodes: NodeArray<Node>,
                parent: Node,
                parentStartLine: number,
                parentDynamicIndentation: DynamicIndentation): void {

                const listStartToken = getOpenTokenForList(parent, nodes);
                const listEndToken = getCloseTokenForOpenToken(listStartToken);

                let listDynamicIndentation = parentDynamicIndentation;
                let startLine = parentStartLine;

                if (listStartToken !== SyntaxKind.Unknown) {
                    // introduce a new indentation scope for lists (including list start and end tokens)
                    while (formattingScanner.isOnToken()) {
                        const tokenInfo = formattingScanner.readTokenInfo(parent);
                        if (tokenInfo.token.end > nodes.pos) {
                            // stop when formatting scanner moves past the beginning of node list
                            break;
                        }
                        else if (tokenInfo.token.kind === listStartToken) {
                            // consume list start token
                            startLine = sourceFile.getLineAndCharacterOfPosition(tokenInfo.token.pos).line;
                            const indentation =
                                computeIndentation(tokenInfo.token, startLine, Constants.Unknown, parent, parentDynamicIndentation, parentStartLine);

                            listDynamicIndentation = getDynamicIndentation(parent, parentStartLine, indentation.indentation, indentation.delta);
                            consumeTokenAndAdvanceScanner(tokenInfo, parent, listDynamicIndentation, parent);
                        }
                        else {
                            // consume any tokens that precede the list as child elements of 'node' using its indentation scope
                            consumeTokenAndAdvanceScanner(tokenInfo, parent, parentDynamicIndentation, parent);
                        }
                    }
                }

                let inheritedIndentation = Constants.Unknown;
                for (let i = 0; i < nodes.length; i++) {
                    const child = nodes[i];
                    inheritedIndentation = processChildNode(child, inheritedIndentation, node, listDynamicIndentation, startLine, startLine, /*isListItem*/ true, /*isFirstListItem*/ i === 0);
                }

                if (listEndToken !== SyntaxKind.Unknown) {
                    if (formattingScanner.isOnToken()) {
                        const tokenInfo = formattingScanner.readTokenInfo(parent);
                        // consume the list end token only if it is still belong to the parent
                        // there might be the case when current token matches end token but does not considered as one
                        // function (x: function) <--
                        // without this check close paren will be interpreted as list end token for function expression which is wrong
                        if (tokenInfo.token.kind === listEndToken && rangeContainsRange(parent, tokenInfo.token)) {
                            // consume list end token
                            consumeTokenAndAdvanceScanner(tokenInfo, parent, listDynamicIndentation, parent);
                        }
                    }
                }
            }

            function consumeTokenAndAdvanceScanner(currentTokenInfo: TokenInfo, parent: Node, dynamicIndentation: DynamicIndentation, container: Node): void {
                Debug.assert(rangeContainsRange(parent, currentTokenInfo.token));

                const lastTriviaWasNewLine = formattingScanner.lastTrailingTriviaWasNewLine();
                let indentToken = false;

                if (currentTokenInfo.leadingTrivia) {
                    processTrivia(currentTokenInfo.leadingTrivia, parent, childContextNode, dynamicIndentation);
                }

                let lineAdded: boolean;
                const isTokenInRange = rangeContainsRange(originalRange, currentTokenInfo.token);

                const tokenStart = sourceFile.getLineAndCharacterOfPosition(currentTokenInfo.token.pos);
                if (isTokenInRange) {
                    const rangeHasError = rangeContainsError(currentTokenInfo.token);
                    // save previousRange since processRange will overwrite this value with current one
                    const savePreviousRange = previousRange;
                    lineAdded = processRange(currentTokenInfo.token, tokenStart, parent, childContextNode, dynamicIndentation);
                    if (rangeHasError) {
                        // do not indent comments\token if token range overlaps with some error
                        indentToken = false;
                    }
                    else {
                        if (lineAdded !== undefined) {
                            indentToken = lineAdded;
                        }
                        else {
                            // indent token only if end line of previous range does not match start line of the token
                            const prevEndLine = savePreviousRange && sourceFile.getLineAndCharacterOfPosition(savePreviousRange.end).line;
                            indentToken = lastTriviaWasNewLine && tokenStart.line !== prevEndLine;
                        }
                    }
                }

                if (currentTokenInfo.trailingTrivia) {
                    processTrivia(currentTokenInfo.trailingTrivia, parent, childContextNode, dynamicIndentation);
                }

                if (indentToken) {
                    const tokenIndentation = (isTokenInRange && !rangeContainsError(currentTokenInfo.token)) ?
                        dynamicIndentation.getIndentationForToken(tokenStart.line, currentTokenInfo.token.kind, container) :
                        Constants.Unknown;

                    let indentNextTokenOrTrivia = true;
                    if (currentTokenInfo.leadingTrivia) {
                        const commentIndentation = dynamicIndentation.getIndentationForComment(currentTokenInfo.token.kind, tokenIndentation, container);

                        for (const triviaItem of currentTokenInfo.leadingTrivia) {
                            const triviaInRange = rangeContainsRange(originalRange, triviaItem);
                            switch (triviaItem.kind) {
                                case SyntaxKind.MultiLineCommentTrivia:
                                    if (triviaInRange) {
                                        indentMultilineComment(triviaItem, commentIndentation, /*firstLineIsIndented*/ !indentNextTokenOrTrivia);
                                    }
                                    indentNextTokenOrTrivia = false;
                                    break;
                                case SyntaxKind.SingleLineCommentTrivia:
                                    if (indentNextTokenOrTrivia && triviaInRange) {
                                        insertIndentation(triviaItem.pos, commentIndentation, /*lineAdded*/ false);
                                    }
                                    indentNextTokenOrTrivia = false;
                                    break;
                                case SyntaxKind.NewLineTrivia:
                                    indentNextTokenOrTrivia = true;
                                    break;
                            }
                        }
                    }

                    // indent token only if is it is in target range and does not overlap with any error ranges
                    if (tokenIndentation !== Constants.Unknown && indentNextTokenOrTrivia) {
                        insertIndentation(currentTokenInfo.token.pos, tokenIndentation, lineAdded);

                        lastIndentedLine = tokenStart.line;
                        indentationOnLastIndentedLine = tokenIndentation;
                    }
                }

                formattingScanner.advance();

                childContextNode = parent;
            }
        }

        function processTrivia(trivia: TextRangeWithKind[], parent: Node, contextNode: Node, dynamicIndentation: DynamicIndentation): void {
            for (const triviaItem of trivia) {
                if (isComment(triviaItem.kind) && rangeContainsRange(originalRange, triviaItem)) {
                    const triviaItemStart = sourceFile.getLineAndCharacterOfPosition(triviaItem.pos);
                    processRange(triviaItem, triviaItemStart, parent, contextNode, dynamicIndentation);
                }
            }
        }

        function processRange(range: TextRangeWithKind,
            rangeStart: LineAndCharacter,
            parent: Node,
            contextNode: Node,
            dynamicIndentation: DynamicIndentation): boolean {

            const rangeHasError = rangeContainsError(range);
            let lineAdded: boolean;
            if (!rangeHasError && !previousRangeHasError) {
                if (!previousRange) {
                    // trim whitespaces starting from the beginning of the span up to the current line
                    const originalStart = sourceFile.getLineAndCharacterOfPosition(originalRange.pos);
                    trimTrailingWhitespacesForLines(originalStart.line, rangeStart.line);
                }
                else {
                    lineAdded =
                        processPair(range, rangeStart.line, parent, previousRange, previousRangeStartLine, previousParent, contextNode, dynamicIndentation);
                }
            }

            previousRange = range;
            previousParent = parent;
            previousRangeStartLine = rangeStart.line;
            previousRangeHasError = rangeHasError;

            return lineAdded;
        }

        function processPair(currentItem: TextRangeWithKind,
            currentStartLine: number,
            currentParent: Node,
            previousItem: TextRangeWithKind,
            previousStartLine: number,
            previousParent: Node,
            contextNode: Node,
            dynamicIndentation: DynamicIndentation): boolean {

            formattingContext.updateContext(previousItem, previousParent, currentItem, currentParent, contextNode);

            const rule = rulesProvider.getRulesMap().GetRule(formattingContext);

            let trimTrailingWhitespaces: boolean;
            let lineAdded: boolean;
            if (rule) {
                applyRuleEdits(rule, previousItem, previousStartLine, currentItem, currentStartLine);

                if (rule.Operation.Action & (RuleAction.Space | RuleAction.Delete) && currentStartLine !== previousStartLine) {
                    lineAdded = false;
                    // Handle the case where the next line is moved to be the end of this line.
                    // In this case we don't indent the next line in the next pass.
                    if (currentParent.getStart(sourceFile) === currentItem.pos) {
                        dynamicIndentation.recomputeIndentation(/*lineAddedByFormatting*/ false);
                    }
                }
                else if (rule.Operation.Action & RuleAction.NewLine && currentStartLine === previousStartLine) {
                    lineAdded = true;
                    // Handle the case where token2 is moved to the new line.
                    // In this case we indent token2 in the next pass but we set
                    // sameLineIndent flag to notify the indenter that the indentation is within the line.
                    if (currentParent.getStart(sourceFile) === currentItem.pos) {
                        dynamicIndentation.recomputeIndentation(/*lineAddedByFormatting*/ true);
                    }
                }

                // We need to trim trailing whitespace between the tokens if they were on different lines, and no rule was applied to put them on the same line
                trimTrailingWhitespaces = !(rule.Operation.Action & RuleAction.Delete) && rule.Flag !== RuleFlags.CanDeleteNewLines;
            }
            else {
                trimTrailingWhitespaces = true;
            }

            if (currentStartLine !== previousStartLine && trimTrailingWhitespaces) {
                // We need to trim trailing whitespace between the tokens if they were on different lines, and no rule was applied to put them on the same line
                trimTrailingWhitespacesForLines(previousStartLine, currentStartLine, previousItem);
            }

            return lineAdded;
        }

        function insertIndentation(pos: number, indentation: number, lineAdded: boolean): void {
            const indentationString = getIndentationString(indentation, options);
            if (lineAdded) {
                // new line is added before the token by the formatting rules
                // insert indentation string at the very beginning of the token
                recordReplace(pos, 0, indentationString);
            }
            else {
                const tokenStart = sourceFile.getLineAndCharacterOfPosition(pos);
                const startLinePosition = getStartPositionOfLine(tokenStart.line, sourceFile);
                if (indentation !== characterToColumn(startLinePosition, tokenStart.character) || indentationIsDifferent(indentationString, startLinePosition)) {
                    recordReplace(startLinePosition, tokenStart.character, indentationString);
                }
            }
        }

        function characterToColumn(startLinePosition: number, characterInLine: number): number {
            let column = 0;
            for (let i = 0; i < characterInLine; i++) {
                if (sourceFile.text.charCodeAt(startLinePosition + i) === CharacterCodes.tab) {
                    column += options.tabSize - column % options.tabSize;
                }
                else {
                    column++;
                }
            }
            return column;
        }

        function indentationIsDifferent(indentationString: string, startLinePosition: number): boolean {
            return indentationString !== sourceFile.text.substr(startLinePosition, indentationString.length);
        }

        function indentMultilineComment(commentRange: TextRange, indentation: number, firstLineIsIndented: boolean) {
            // split comment in lines
            let startLine = sourceFile.getLineAndCharacterOfPosition(commentRange.pos).line;
            const endLine = sourceFile.getLineAndCharacterOfPosition(commentRange.end).line;
            let parts: TextRange[];
            if (startLine === endLine) {
                if (!firstLineIsIndented) {
                    // treat as single line comment
                    insertIndentation(commentRange.pos, indentation, /*lineAdded*/ false);
                }
                return;
            }
            else {
                parts = [];
                let startPos = commentRange.pos;
                for (let line = startLine; line < endLine; line++) {
                    const endOfLine = getEndLinePosition(line, sourceFile);
                    parts.push({ pos: startPos, end: endOfLine });
                    startPos = getStartPositionOfLine(line + 1, sourceFile);
                }

                parts.push({ pos: startPos, end: commentRange.end });
            }

            const startLinePos = getStartPositionOfLine(startLine, sourceFile);

            const nonWhitespaceColumnInFirstPart =
                SmartIndenter.findFirstNonWhitespaceCharacterAndColumn(startLinePos, parts[0].pos, sourceFile, options);

            if (indentation === nonWhitespaceColumnInFirstPart.column) {
                return;
            }

            let startIndex = 0;
            if (firstLineIsIndented) {
                startIndex = 1;
                startLine++;
            }

            // shift all parts on the delta size
            const delta = indentation - nonWhitespaceColumnInFirstPart.column;
            for (let i = startIndex; i < parts.length; i++ , startLine++) {
                const startLinePos = getStartPositionOfLine(startLine, sourceFile);
                const nonWhitespaceCharacterAndColumn =
                    i === 0
                        ? nonWhitespaceColumnInFirstPart
                        : SmartIndenter.findFirstNonWhitespaceCharacterAndColumn(parts[i].pos, parts[i].end, sourceFile, options);

                const newIndentation = nonWhitespaceCharacterAndColumn.column + delta;
                if (newIndentation > 0) {
                    const indentationString = getIndentationString(newIndentation, options);
                    recordReplace(startLinePos, nonWhitespaceCharacterAndColumn.character, indentationString);
                }
                else {
                    recordDelete(startLinePos, nonWhitespaceCharacterAndColumn.character);
                }
            }
        }

        function trimTrailingWhitespacesForLines(line1: number, line2: number, range?: TextRangeWithKind) {
            for (let line = line1; line < line2; line++) {
                const lineStartPosition = getStartPositionOfLine(line, sourceFile);
                const lineEndPosition = getEndLinePosition(line, sourceFile);

                // do not trim whitespaces in comments or template expression
                if (range && (isComment(range.kind) || isStringOrRegularExpressionOrTemplateLiteral(range.kind)) && range.pos <= lineEndPosition && range.end > lineEndPosition) {
                    continue;
                }

                const whitespaceStart = getTrailingWhitespaceStartPosition(lineStartPosition, lineEndPosition);
                if (whitespaceStart !== -1) {
                    Debug.assert(whitespaceStart === lineStartPosition || !isWhiteSpaceSingleLine(sourceFile.text.charCodeAt(whitespaceStart - 1)));
                    recordDelete(whitespaceStart, lineEndPosition + 1 - whitespaceStart);
                }
            }
        }

        /**
         * @param start The position of the first character in range
         * @param end The position of the last character in range
         */
        function getTrailingWhitespaceStartPosition(start: number, end: number) {
            let pos = end;
            while (pos >= start && isWhiteSpaceSingleLine(sourceFile.text.charCodeAt(pos))) {
                pos--;
            }
            if (pos !== end) {
                return pos + 1;
            }
            return -1;
        }

        /**
         * Trimming will be done for lines after the previous range
         */
        function trimTrailingWhitespacesForRemainingRange() {
            const startPosition = previousRange ? previousRange.end : originalRange.pos;

            const startLine = sourceFile.getLineAndCharacterOfPosition(startPosition).line;
            const endLine = sourceFile.getLineAndCharacterOfPosition(originalRange.end).line;

            trimTrailingWhitespacesForLines(startLine, endLine + 1, previousRange);
        }

        function newTextChange(start: number, len: number, newText: string): TextChange {
            return { span: createTextSpan(start, len), newText };
        }

        function recordDelete(start: number, len: number) {
            if (len) {
                edits.push(newTextChange(start, len, ""));
            }
        }

        function recordReplace(start: number, len: number, newText: string) {
            if (len || newText) {
                edits.push(newTextChange(start, len, newText));
            }
        }

        function applyRuleEdits(rule: Rule,
            previousRange: TextRangeWithKind,
            previousStartLine: number,
            currentRange: TextRangeWithKind,
            currentStartLine: number): void {

            switch (rule.Operation.Action) {
                case RuleAction.Ignore:
                    // no action required
                    return;
                case RuleAction.Delete:
                    if (previousRange.end !== currentRange.pos) {
                        // delete characters starting from t1.end up to t2.pos exclusive
                        recordDelete(previousRange.end, currentRange.pos - previousRange.end);
                    }
                    break;
                case RuleAction.NewLine:
                    // exit early if we on different lines and rule cannot change number of newlines
                    // if line1 and line2 are on subsequent lines then no edits are required - ok to exit
                    // if line1 and line2 are separated with more than one newline - ok to exit since we cannot delete extra new lines
                    if (rule.Flag !== RuleFlags.CanDeleteNewLines && previousStartLine !== currentStartLine) {
                        return;
                    }

                    // edit should not be applied only if we have one line feed between elements
                    const lineDelta = currentStartLine - previousStartLine;
                    if (lineDelta !== 1) {
                        recordReplace(previousRange.end, currentRange.pos - previousRange.end, options.newLineCharacter);
                    }
                    break;
                case RuleAction.Space:
                    // exit early if we on different lines and rule cannot change number of newlines
                    if (rule.Flag !== RuleFlags.CanDeleteNewLines && previousStartLine !== currentStartLine) {
                        return;
                    }

                    const posDelta = currentRange.pos - previousRange.end;
                    if (posDelta !== 1 || sourceFile.text.charCodeAt(previousRange.end) !== CharacterCodes.space) {
                        recordReplace(previousRange.end, currentRange.pos - previousRange.end, " ");
                    }
                    break;
            }
        }
    }

    function getOpenTokenForList(node: Node, list: Node[]) {
        switch (node.kind) {
            case SyntaxKind.Constructor:
            case SyntaxKind.FunctionDeclaration:
            case SyntaxKind.FunctionExpression:
            case SyntaxKind.MethodDeclaration:
            case SyntaxKind.MethodSignature:
            case SyntaxKind.ArrowFunction:
                if ((<FunctionDeclaration>node).typeParameters === list) {
                    return SyntaxKind.LessThanToken;
                }
                else if ((<FunctionDeclaration>node).parameters === list) {
                    return SyntaxKind.OpenParenToken;
                }
                break;
            case SyntaxKind.CallExpression:
            case SyntaxKind.NewExpression:
                if ((<CallExpression>node).typeArguments === list) {
                    return SyntaxKind.LessThanToken;
                }
                else if ((<CallExpression>node).arguments === list) {
                    return SyntaxKind.OpenParenToken;
                }
                break;
            case SyntaxKind.TypeReference:
                if ((<TypeReferenceNode>node).typeArguments === list) {
                    return SyntaxKind.LessThanToken;
                }
        }

        return SyntaxKind.Unknown;
    }

    function getCloseTokenForOpenToken(kind: SyntaxKind) {
        switch (kind) {
            case SyntaxKind.OpenParenToken:
                return SyntaxKind.CloseParenToken;
            case SyntaxKind.LessThanToken:
                return SyntaxKind.GreaterThanToken;
        }

        return SyntaxKind.Unknown;
    }

    let internedSizes: { tabSize: number; indentSize: number };
    let internedTabsIndentation: string[];
    let internedSpacesIndentation: string[];

    export function getIndentationString(indentation: number, options: EditorSettings): string {
        // reset interned strings if FormatCodeOptions were changed
        const resetInternedStrings =
            !internedSizes || (internedSizes.tabSize !== options.tabSize || internedSizes.indentSize !== options.indentSize);

        if (resetInternedStrings) {
            internedSizes = { tabSize: options.tabSize, indentSize: options.indentSize };
            internedTabsIndentation = internedSpacesIndentation = undefined;
        }

        if (!options.convertTabsToSpaces) {
            const tabs = Math.floor(indentation / options.tabSize);
            const spaces = indentation - tabs * options.tabSize;

            let tabString: string;
            if (!internedTabsIndentation) {
                internedTabsIndentation = [];
            }

            if (internedTabsIndentation[tabs] === undefined) {
                internedTabsIndentation[tabs] = tabString = repeat("\t", tabs);
            }
            else {
                tabString = internedTabsIndentation[tabs];
            }

            return spaces ? tabString + repeat(" ", spaces) : tabString;
        }
        else {
            let spacesString: string;
            const quotient = Math.floor(indentation / options.indentSize);
            const remainder = indentation % options.indentSize;
            if (!internedSpacesIndentation) {
                internedSpacesIndentation = [];
            }

            if (internedSpacesIndentation[quotient] === undefined) {
                spacesString = repeat(" ", options.indentSize * quotient);
                internedSpacesIndentation[quotient] = spacesString;
            }
            else {
                spacesString = internedSpacesIndentation[quotient];
            }

            return remainder ? spacesString + repeat(" ", remainder) : spacesString;
        }

        function repeat(value: string, count: number): string {
            let s = "";
            for (let i = 0; i < count; i++) {
                s += value;
            }

            return s;
        }
    }
}
