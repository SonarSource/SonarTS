/// <reference path="core.ts"/>
/// <reference path="utilities.ts"/>

namespace ts {
    function createSynthesizedNode(kind: SyntaxKind): Node {
        const node = createNode(kind, -1, -1);
        node.flags |= NodeFlags.Synthesized;
        return node;
    }

    /* @internal */
    export function updateNode<T extends Node>(updated: T, original: T): T {
        if (updated !== original) {
            setOriginalNode(updated, original);
            setTextRange(updated, original);
            if (original.startsOnNewLine) {
                updated.startsOnNewLine = true;
            }
            aggregateTransformFlags(updated);
        }
        return updated;
    }

    /**
     * Make `elements` into a `NodeArray<T>`. If `elements` is `undefined`, returns an empty `NodeArray<T>`.
     */
    export function createNodeArray<T extends Node>(elements?: T[], hasTrailingComma?: boolean): NodeArray<T> {
        if (elements) {
            if (isNodeArray(elements)) {
                return elements;
            }
        }
        else {
            elements = [];
        }

        const array = <NodeArray<T>>elements;
        array.pos = -1;
        array.end = -1;
        array.hasTrailingComma = hasTrailingComma;
        return array;
    }

    /**
     * Creates a shallow, memberwise clone of a node with no source map location.
     */
    /* @internal */
    export function getSynthesizedClone<T extends Node>(node: T | undefined): T {
        // We don't use "clone" from core.ts here, as we need to preserve the prototype chain of
        // the original node. We also need to exclude specific properties and only include own-
        // properties (to skip members already defined on the shared prototype).
        const clone = <T>createSynthesizedNode(node.kind);
        clone.flags |= node.flags;
        setOriginalNode(clone, node);

        for (const key in node) {
            if (clone.hasOwnProperty(key) || !node.hasOwnProperty(key)) {
                continue;
            }

            (<any>clone)[key] = (<any>node)[key];
        }

        return clone;
    }

    // Literals

    export function createLiteral(value: string): StringLiteral;
    export function createLiteral(value: number): NumericLiteral;
    export function createLiteral(value: boolean): BooleanLiteral;
    /** Create a string literal whose source text is read from a source node during emit. */
    export function createLiteral(sourceNode: StringLiteral | NumericLiteral | Identifier): StringLiteral;
    export function createLiteral(value: string | number | boolean): PrimaryExpression;
    export function createLiteral(value: string | number | boolean | StringLiteral | NumericLiteral | Identifier): PrimaryExpression {
        if (typeof value === "number") {
            return createNumericLiteral(value + "");
        }
        if (typeof value === "boolean") {
            return value ? createTrue() : createFalse();
        }
        if (typeof value === "string") {
            return createStringLiteral(value);
        }
        return createLiteralFromNode(value);
    }

    export function createNumericLiteral(value: string): NumericLiteral {
        const node = <NumericLiteral>createSynthesizedNode(SyntaxKind.NumericLiteral);
        node.text = value;
        node.numericLiteralFlags = 0;
        return node;
    }

    function createStringLiteral(text: string): StringLiteral {
        const node = <StringLiteral>createSynthesizedNode(SyntaxKind.StringLiteral);
        node.text = text;
        return node;
    }

    function createLiteralFromNode(sourceNode: StringLiteral | NumericLiteral | Identifier): StringLiteral {
        const node = createStringLiteral(sourceNode.text);
        node.textSourceNode = sourceNode;
        return node;
    }


    // Identifiers

    export function createIdentifier(text: string): Identifier {
        const node = <Identifier>createSynthesizedNode(SyntaxKind.Identifier);
        node.text = escapeIdentifier(text);
        node.originalKeywordKind = text ? stringToToken(text) : SyntaxKind.Unknown;
        node.autoGenerateKind = GeneratedIdentifierKind.None;
        node.autoGenerateId = 0;
        return node;
    }

    let nextAutoGenerateId = 0;

    /** Create a unique temporary variable. */
    export function createTempVariable(recordTempVariable: ((node: Identifier) => void) | undefined): Identifier {
        const name = createIdentifier("");
        name.autoGenerateKind = GeneratedIdentifierKind.Auto;
        name.autoGenerateId = nextAutoGenerateId;
        nextAutoGenerateId++;
        if (recordTempVariable) {
            recordTempVariable(name);
        }
        return name;
    }

    /** Create a unique temporary variable for use in a loop. */
    export function createLoopVariable(): Identifier {
        const name = createIdentifier("");
        name.autoGenerateKind = GeneratedIdentifierKind.Loop;
        name.autoGenerateId = nextAutoGenerateId;
        nextAutoGenerateId++;
        return name;
    }

    /** Create a unique name based on the supplied text. */
    export function createUniqueName(text: string): Identifier {
        const name = createIdentifier(text);
        name.autoGenerateKind = GeneratedIdentifierKind.Unique;
        name.autoGenerateId = nextAutoGenerateId;
        nextAutoGenerateId++;
        return name;
    }

    /** Create a unique name generated for a node. */
    export function getGeneratedNameForNode(node: Node): Identifier {
        const name = createIdentifier("");
        name.autoGenerateKind = GeneratedIdentifierKind.Node;
        name.autoGenerateId = nextAutoGenerateId;
        name.original = node;
        nextAutoGenerateId++;
        return name;
    }

    // Punctuation

    export function createToken<TKind extends SyntaxKind>(token: TKind) {
        return <Token<TKind>>createSynthesizedNode(token);
    }

    // Reserved words

    export function createSuper() {
        return <SuperExpression>createSynthesizedNode(SyntaxKind.SuperKeyword);
    }

    export function createThis() {
        return <ThisExpression & Token<SyntaxKind.ThisKeyword>>createSynthesizedNode(SyntaxKind.ThisKeyword);
    }

    export function createNull() {
        return <NullLiteral & Token<SyntaxKind.NullKeyword>>createSynthesizedNode(SyntaxKind.NullKeyword);
    }

    export function createTrue() {
        return <BooleanLiteral & Token<SyntaxKind.TrueKeyword>>createSynthesizedNode(SyntaxKind.TrueKeyword);
    }

    export function createFalse() {
        return <BooleanLiteral & Token<SyntaxKind.FalseKeyword>>createSynthesizedNode(SyntaxKind.FalseKeyword);
    }

    // Names

    export function createQualifiedName(left: EntityName, right: string | Identifier) {
        const node = <QualifiedName>createSynthesizedNode(SyntaxKind.QualifiedName);
        node.left = left;
        node.right = asName(right);
        return node;
    }

    export function updateQualifiedName(node: QualifiedName, left: EntityName, right: Identifier) {
        return node.left !== left
            || node.right !== right
            ? updateNode(createQualifiedName(left, right), node)
            : node;
    }

    export function createComputedPropertyName(expression: Expression) {
        const node = <ComputedPropertyName>createSynthesizedNode(SyntaxKind.ComputedPropertyName);
        node.expression = expression;
        return node;
    }

    export function updateComputedPropertyName(node: ComputedPropertyName, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createComputedPropertyName(expression), node)
            : node;
    }

    // Signature elements

    export function createTypeParameterDeclaration(name: string | Identifier, constraint: TypeNode | undefined, defaultType: TypeNode | undefined) {
        const node = createSynthesizedNode(SyntaxKind.TypeParameter) as TypeParameterDeclaration;
        node.name = asName(name);
        node.constraint = constraint;
        node.default = defaultType;
        return node;
    }

    export function updateTypeParameterDeclaration(node: TypeParameterDeclaration, name: Identifier, constraint: TypeNode | undefined, defaultType: TypeNode | undefined) {
        return node.name !== name
            || node.constraint !== constraint
            || node.default !== defaultType
            ? updateNode(createTypeParameterDeclaration(name, constraint, defaultType), node)
            : node;
    }

    export function createParameter(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, dotDotDotToken: DotDotDotToken | undefined, name: string | BindingName, questionToken?: QuestionToken, type?: TypeNode, initializer?: Expression) {
        const node = <ParameterDeclaration>createSynthesizedNode(SyntaxKind.Parameter);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.dotDotDotToken = dotDotDotToken;
        node.name = asName(name);
        node.questionToken = questionToken;
        node.type = type;
        node.initializer = initializer ? parenthesizeExpressionForList(initializer) : undefined;
        return node;
    }

    export function updateParameter(node: ParameterDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, dotDotDotToken: DotDotDotToken | undefined, name: string | BindingName, questionToken: QuestionToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.dotDotDotToken !== dotDotDotToken
            || node.name !== name
            || node.questionToken !== questionToken
            || node.type !== type
            || node.initializer !== initializer
            ? updateNode(createParameter(decorators, modifiers, dotDotDotToken, name, node.questionToken, type, initializer), node)
            : node;
    }

    export function createDecorator(expression: Expression) {
        const node = <Decorator>createSynthesizedNode(SyntaxKind.Decorator);
        node.expression = parenthesizeForAccess(expression);
        return node;
    }

    export function updateDecorator(node: Decorator, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createDecorator(expression), node)
            : node;
    }


    // Type Elements

    export function createPropertySignature(name: PropertyName | string, questionToken: QuestionToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined): PropertySignature {
        const node = createSynthesizedNode(SyntaxKind.PropertySignature) as PropertySignature;
        node.name = asName(name);
        node.questionToken = questionToken;
        node.type = type;
        node.initializer = initializer;
        return node;
    }

    export function updatePropertySignature(node: PropertySignature, name: PropertyName, questionToken: QuestionToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined) {
        return node.name !== name
            || node.questionToken !== questionToken
            || node.type !== type
            || node.initializer !== initializer
            ? updateNode(createPropertySignature(name, questionToken, type, initializer), node)
            : node;
    }

    export function createProperty(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: string | PropertyName, questionToken: QuestionToken | undefined, type: TypeNode | undefined, initializer: Expression) {
        const node = <PropertyDeclaration>createSynthesizedNode(SyntaxKind.PropertyDeclaration);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.questionToken = questionToken;
        node.type = type;
        node.initializer = initializer;
        return node;
    }

    export function updateProperty(node: PropertyDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: PropertyName, type: TypeNode | undefined, initializer: Expression) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.name !== name
            || node.type !== type
            || node.initializer !== initializer
            ? updateNode(createProperty(decorators, modifiers, name, node.questionToken, type, initializer), node)
            : node;
    }

    export function createMethodSignature(typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined, name: string | PropertyName, questionToken: QuestionToken | undefined) {
        const node = createSignatureDeclaration(SyntaxKind.MethodSignature, typeParameters, parameters, type) as MethodSignature;
        node.name = asName(name);
        node.questionToken = questionToken;
        return node;
    }

    export function updateMethodSignature(node: MethodSignature, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined, name: PropertyName, questionToken: QuestionToken | undefined) {
        return node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            || node.name !== name
            || node.questionToken !== questionToken
            ? updateNode(createMethodSignature(typeParameters, parameters, type, name, questionToken), node)
            : node;
    }

    export function createMethod(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, asteriskToken: AsteriskToken | undefined, name: string | PropertyName, questionToken: QuestionToken | undefined, typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined, body: Block | undefined) {
        const node = <MethodDeclaration>createSynthesizedNode(SyntaxKind.MethodDeclaration);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.asteriskToken = asteriskToken;
        node.name = asName(name);
        node.questionToken = questionToken;
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.body = body;
        return node;
    }

    export function updateMethod(node: MethodDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, asteriskToken: AsteriskToken | undefined, name: PropertyName, questionToken: QuestionToken | undefined, typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined, body: Block | undefined) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.asteriskToken !== asteriskToken
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            || node.body !== body
            ? updateNode(createMethod(decorators, modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body), node)
            : node;
    }

    export function createConstructor(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, parameters: ParameterDeclaration[], body: Block | undefined) {
        const node = <ConstructorDeclaration>createSynthesizedNode(SyntaxKind.Constructor);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.typeParameters = undefined;
        node.parameters = createNodeArray(parameters);
        node.type = undefined;
        node.body = body;
        return node;
    }

    export function updateConstructor(node: ConstructorDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, parameters: ParameterDeclaration[], body: Block | undefined) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.parameters !== parameters
            || node.body !== body
            ? updateNode(createConstructor(decorators, modifiers, parameters, body), node)
            : node;
    }

    export function createGetAccessor(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: string | PropertyName, parameters: ParameterDeclaration[], type: TypeNode | undefined, body: Block | undefined) {
        const node = <GetAccessorDeclaration>createSynthesizedNode(SyntaxKind.GetAccessor);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.typeParameters = undefined;
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.body = body;
        return node;
    }

    export function updateGetAccessor(node: GetAccessorDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: PropertyName, parameters: ParameterDeclaration[], type: TypeNode | undefined, body: Block | undefined) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.name !== name
            || node.parameters !== parameters
            || node.type !== type
            || node.body !== body
            ? updateNode(createGetAccessor(decorators, modifiers, name, parameters, type, body), node)
            : node;
    }

    export function createSetAccessor(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: string | PropertyName, parameters: ParameterDeclaration[], body: Block | undefined) {
        const node = <SetAccessorDeclaration>createSynthesizedNode(SyntaxKind.SetAccessor);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.typeParameters = undefined;
        node.parameters = createNodeArray(parameters);
        node.body = body;
        return node;
    }

    export function updateSetAccessor(node: SetAccessorDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: PropertyName, parameters: ParameterDeclaration[], body: Block | undefined) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.name !== name
            || node.parameters !== parameters
            || node.body !== body
            ? updateNode(createSetAccessor(decorators, modifiers, name, parameters, body), node)
            : node;
    }

    export function createCallSignature(typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined) {
        return createSignatureDeclaration(SyntaxKind.CallSignature, typeParameters, parameters, type) as CallSignatureDeclaration;
    }

    export function updateCallSignature(node: CallSignatureDeclaration, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined) {
        return updateSignatureDeclaration(node, typeParameters, parameters, type);
    }

    export function createConstructSignature(typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined) {
        return createSignatureDeclaration(SyntaxKind.ConstructSignature, typeParameters, parameters, type) as ConstructSignatureDeclaration;
    }

    export function updateConstructSignature(node: ConstructSignatureDeclaration, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined) {
        return updateSignatureDeclaration(node, typeParameters, parameters, type);
    }

    export function createIndexSignature(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, parameters: ParameterDeclaration[], type: TypeNode): IndexSignatureDeclaration {
        const node = createSynthesizedNode(SyntaxKind.IndexSignature) as IndexSignatureDeclaration;
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        return node;
    }

    export function updateIndexSignature(node: IndexSignatureDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, parameters: ParameterDeclaration[], type: TypeNode) {
        return node.parameters !== parameters
            || node.type !== type
            || node.decorators !== decorators
            || node.modifiers !== modifiers
            ? updateNode(createIndexSignature(decorators, modifiers, parameters, type), node)
            : node;
    }

    /* @internal */
    export function createSignatureDeclaration(kind: SyntaxKind, typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined) {
        const node = createSynthesizedNode(kind) as SignatureDeclaration;
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = asNodeArray(parameters);
        node.type = type;
        return node;
    }

    function updateSignatureDeclaration<T extends SignatureDeclaration>(node: T, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined): T {
        return node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            ? updateNode(<T>createSignatureDeclaration(node.kind, typeParameters, parameters, type), node)
            : node;
    }

    // Types

    export function createKeywordTypeNode(kind: KeywordTypeNode["kind"]) {
        return <KeywordTypeNode>createSynthesizedNode(kind);
    }

    export function createTypePredicateNode(parameterName: Identifier | ThisTypeNode | string, type: TypeNode) {
        const node = createSynthesizedNode(SyntaxKind.TypePredicate) as TypePredicateNode;
        node.parameterName = asName(parameterName);
        node.type = type;
        return node;
    }

    export function updateTypePredicateNode(node: TypePredicateNode, parameterName: Identifier | ThisTypeNode, type: TypeNode) {
        return node.parameterName !== parameterName
            || node.type !== type
            ? updateNode(createTypePredicateNode(parameterName, type), node)
            : node;
    }

    export function createTypeReferenceNode(typeName: string | EntityName, typeArguments: TypeNode[] | undefined) {
        const node = createSynthesizedNode(SyntaxKind.TypeReference) as TypeReferenceNode;
        node.typeName = asName(typeName);
        node.typeArguments = asNodeArray(typeArguments);
        return node;
    }

    export function updateTypeReferenceNode(node: TypeReferenceNode, typeName: EntityName, typeArguments: NodeArray<TypeNode> | undefined) {
        return node.typeName !== typeName
            || node.typeArguments !== typeArguments
            ? updateNode(createTypeReferenceNode(typeName, typeArguments), node)
            : node;
    }

    export function createFunctionTypeNode(typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined) {
        return createSignatureDeclaration(SyntaxKind.FunctionType, typeParameters, parameters, type) as FunctionTypeNode;
    }

    export function updateFunctionTypeNode(node: FunctionTypeNode, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined) {
        return <FunctionTypeNode>updateSignatureDeclaration(node, typeParameters, parameters, type);
    }

    export function createConstructorTypeNode(typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined) {
        return createSignatureDeclaration(SyntaxKind.ConstructorType, typeParameters, parameters, type) as ConstructorTypeNode;
    }

    export function updateConstructorTypeNode(node: ConstructorTypeNode, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined) {
        return <ConstructorTypeNode>updateSignatureDeclaration(node, typeParameters, parameters, type);
    }

    export function createTypeQueryNode(exprName: EntityName) {
        const node = createSynthesizedNode(SyntaxKind.TypeQuery) as TypeQueryNode;
        node.exprName = exprName;
        return node;
    }

    export function updateTypeQueryNode(node: TypeQueryNode, exprName: EntityName) {
        return node.exprName !== exprName
            ? updateNode(createTypeQueryNode(exprName), node)
            : node;
    }

    export function createTypeLiteralNode(members: TypeElement[]) {
        const node = createSynthesizedNode(SyntaxKind.TypeLiteral) as TypeLiteralNode;
        node.members = createNodeArray(members);
        return node;
    }

    export function updateTypeLiteralNode(node: TypeLiteralNode, members: NodeArray<TypeElement>) {
        return node.members !== members
            ? updateNode(createTypeLiteralNode(members), node)
            : node;
    }

    export function createArrayTypeNode(elementType: TypeNode) {
        const node = createSynthesizedNode(SyntaxKind.ArrayType) as ArrayTypeNode;
        node.elementType = elementType;
        return node;
    }

    export function updateArrayTypeNode(node: ArrayTypeNode, elementType: TypeNode): ArrayTypeNode {
        return node.elementType !== elementType
            ? updateNode(createArrayTypeNode(elementType), node)
            : node;
    }

    export function createTupleTypeNode(elementTypes: TypeNode[]) {
        const node = createSynthesizedNode(SyntaxKind.TupleType) as TupleTypeNode;
        node.elementTypes = createNodeArray(elementTypes);
        return node;
    }

    export function updateTypleTypeNode(node: TupleTypeNode, elementTypes: TypeNode[]) {
        return node.elementTypes !== elementTypes
            ? updateNode(createTupleTypeNode(elementTypes), node)
            : node;
    }

    export function createUnionTypeNode(types: TypeNode[]): UnionTypeNode {
        return <UnionTypeNode>createUnionOrIntersectionTypeNode(SyntaxKind.UnionType, types);
    }

    export function updateUnionTypeNode(node: UnionTypeNode, types: NodeArray<TypeNode>) {
        return updateUnionOrIntersectionTypeNode(node, types);
    }

    export function createIntersectionTypeNode(types: TypeNode[]): IntersectionTypeNode {
        return <IntersectionTypeNode>createUnionOrIntersectionTypeNode(SyntaxKind.IntersectionType, types);
    }

    export function updateIntersectionTypeNode(node: IntersectionTypeNode, types: NodeArray<TypeNode>) {
        return updateUnionOrIntersectionTypeNode(node, types);
    }

    export function createUnionOrIntersectionTypeNode(kind: SyntaxKind.UnionType | SyntaxKind.IntersectionType, types: TypeNode[]) {
        const node = createSynthesizedNode(kind) as UnionTypeNode | IntersectionTypeNode;
        node.types = createNodeArray(types);
        return node;
    }

    function updateUnionOrIntersectionTypeNode<T extends UnionOrIntersectionTypeNode>(node: T, types: NodeArray<TypeNode>): T {
        return node.types !== types
            ? updateNode(<T>createUnionOrIntersectionTypeNode(node.kind, types), node)
            : node;
    }

    export function createParenthesizedType(type: TypeNode) {
        const node = <ParenthesizedTypeNode>createSynthesizedNode(SyntaxKind.ParenthesizedType);
        node.type = type;
        return node;
    }

    export function updateParenthesizedType(node: ParenthesizedTypeNode, type: TypeNode) {
        return node.type !== type
            ? updateNode(createParenthesizedType(type), node)
            : node;
    }

    export function createThisTypeNode() {
        return <ThisTypeNode>createSynthesizedNode(SyntaxKind.ThisType);
    }

    export function createTypeOperatorNode(type: TypeNode) {
        const node = createSynthesizedNode(SyntaxKind.TypeOperator) as TypeOperatorNode;
        node.operator = SyntaxKind.KeyOfKeyword;
        node.type = type;
        return node;
    }

    export function updateTypeOperatorNode(node: TypeOperatorNode, type: TypeNode) {
        return node.type !== type ? updateNode(createTypeOperatorNode(type), node) : node;
    }

    export function createIndexedAccessTypeNode(objectType: TypeNode, indexType: TypeNode) {
        const node = createSynthesizedNode(SyntaxKind.IndexedAccessType) as IndexedAccessTypeNode;
        node.objectType = objectType;
        node.indexType = indexType;
        return node;
    }

    export function updateIndexedAccessTypeNode(node: IndexedAccessTypeNode, objectType: TypeNode, indexType: TypeNode) {
        return node.objectType !== objectType
            || node.indexType !== indexType
            ? updateNode(createIndexedAccessTypeNode(objectType, indexType), node)
            : node;
    }

    export function createMappedTypeNode(readonlyToken: ReadonlyToken | undefined, typeParameter: TypeParameterDeclaration, questionToken: QuestionToken | undefined, type: TypeNode | undefined): MappedTypeNode {
        const node = createSynthesizedNode(SyntaxKind.MappedType) as MappedTypeNode;
        node.readonlyToken = readonlyToken;
        node.typeParameter = typeParameter;
        node.questionToken = questionToken;
        node.type = type;
        return node;
    }

    export function updateMappedTypeNode(node: MappedTypeNode, readonlyToken: ReadonlyToken | undefined, typeParameter: TypeParameterDeclaration, questionToken: QuestionToken | undefined, type: TypeNode | undefined): MappedTypeNode {
        return node.readonlyToken !== readonlyToken
            || node.typeParameter !== typeParameter
            || node.questionToken !== questionToken
            || node.type !== type
            ? updateNode(createMappedTypeNode(readonlyToken, typeParameter, questionToken, type), node)
            : node;
    }

    export function createLiteralTypeNode(literal: Expression) {
        const node = createSynthesizedNode(SyntaxKind.LiteralType) as LiteralTypeNode;
        node.literal = literal;
        return node;
    }

    export function updateLiteralTypeNode(node: LiteralTypeNode, literal: Expression) {
        return node.literal !== literal
            ? updateNode(createLiteralTypeNode(literal), node)
            : node;
    }

    // Binding Patterns

    export function createObjectBindingPattern(elements: BindingElement[]) {
        const node = <ObjectBindingPattern>createSynthesizedNode(SyntaxKind.ObjectBindingPattern);
        node.elements = createNodeArray(elements);
        return node;
    }

    export function updateObjectBindingPattern(node: ObjectBindingPattern, elements: BindingElement[]) {
        return node.elements !== elements
            ? updateNode(createObjectBindingPattern(elements), node)
            : node;
    }

    export function createArrayBindingPattern(elements: ArrayBindingElement[]) {
        const node = <ArrayBindingPattern>createSynthesizedNode(SyntaxKind.ArrayBindingPattern);
        node.elements = createNodeArray(elements);
        return node;
    }

    export function updateArrayBindingPattern(node: ArrayBindingPattern, elements: ArrayBindingElement[]) {
        return node.elements !== elements
            ? updateNode(createArrayBindingPattern(elements), node)
            : node;
    }

    export function createBindingElement(dotDotDotToken: DotDotDotToken | undefined, propertyName: string | PropertyName | undefined, name: string | BindingName, initializer?: Expression) {
        const node = <BindingElement>createSynthesizedNode(SyntaxKind.BindingElement);
        node.dotDotDotToken = dotDotDotToken;
        node.propertyName = asName(propertyName);
        node.name = asName(name);
        node.initializer = initializer;
        return node;
    }

    export function updateBindingElement(node: BindingElement, dotDotDotToken: DotDotDotToken | undefined, propertyName: PropertyName | undefined, name: BindingName, initializer: Expression | undefined) {
        return node.propertyName !== propertyName
            || node.dotDotDotToken !== dotDotDotToken
            || node.name !== name
            || node.initializer !== initializer
            ? updateNode(createBindingElement(dotDotDotToken, propertyName, name, initializer), node)
            : node;
    }

    // Expression

    export function createArrayLiteral(elements?: Expression[], multiLine?: boolean) {
        const node = <ArrayLiteralExpression>createSynthesizedNode(SyntaxKind.ArrayLiteralExpression);
        node.elements = parenthesizeListElements(createNodeArray(elements));
        if (multiLine) node.multiLine = true;
        return node;
    }

    export function updateArrayLiteral(node: ArrayLiteralExpression, elements: Expression[]) {
        return node.elements !== elements
            ? updateNode(createArrayLiteral(elements, node.multiLine), node)
            : node;
    }

    export function createObjectLiteral(properties?: ObjectLiteralElementLike[], multiLine?: boolean) {
        const node = <ObjectLiteralExpression>createSynthesizedNode(SyntaxKind.ObjectLiteralExpression);
        node.properties = createNodeArray(properties);
        if (multiLine) node.multiLine = true;
        return node;
    }

    export function updateObjectLiteral(node: ObjectLiteralExpression, properties: ObjectLiteralElementLike[]) {
        return node.properties !== properties
            ? updateNode(createObjectLiteral(properties, node.multiLine), node)
            : node;
    }

    export function createPropertyAccess(expression: Expression, name: string | Identifier) {
        const node = <PropertyAccessExpression>createSynthesizedNode(SyntaxKind.PropertyAccessExpression);
        node.expression = parenthesizeForAccess(expression);
        node.name = asName(name);
        setEmitFlags(node, EmitFlags.NoIndentation);
        return node;
    }

    export function updatePropertyAccess(node: PropertyAccessExpression, expression: Expression, name: Identifier) {
        // Because we are updating existed propertyAccess we want to inherit its emitFlags
        // instead of using the default from createPropertyAccess
        return node.expression !== expression
            || node.name !== name
            ? updateNode(setEmitFlags(createPropertyAccess(expression, name), getEmitFlags(node)), node)
            : node;
    }

    export function createElementAccess(expression: Expression, index: number | Expression) {
        const node = <ElementAccessExpression>createSynthesizedNode(SyntaxKind.ElementAccessExpression);
        node.expression = parenthesizeForAccess(expression);
        node.argumentExpression = asExpression(index);
        return node;
    }

    export function updateElementAccess(node: ElementAccessExpression, expression: Expression, argumentExpression: Expression) {
        return node.expression !== expression
            || node.argumentExpression !== argumentExpression
            ? updateNode(createElementAccess(expression, argumentExpression), node)
            : node;
    }

    export function createCall(expression: Expression, typeArguments: TypeNode[] | undefined, argumentsArray: Expression[]) {
        const node = <CallExpression>createSynthesizedNode(SyntaxKind.CallExpression);
        node.expression = parenthesizeForAccess(expression);
        node.typeArguments = asNodeArray(typeArguments);
        node.arguments = parenthesizeListElements(createNodeArray(argumentsArray));
        return node;
    }

    export function updateCall(node: CallExpression, expression: Expression, typeArguments: TypeNode[] | undefined, argumentsArray: Expression[]) {
        return node.expression !== expression
            || node.typeArguments !== typeArguments
            || node.arguments !== argumentsArray
            ? updateNode(createCall(expression, typeArguments, argumentsArray), node)
            : node;
    }

    export function createNew(expression: Expression, typeArguments: TypeNode[] | undefined, argumentsArray: Expression[] | undefined) {
        const node = <NewExpression>createSynthesizedNode(SyntaxKind.NewExpression);
        node.expression = parenthesizeForNew(expression);
        node.typeArguments = asNodeArray(typeArguments);
        node.arguments = argumentsArray ? parenthesizeListElements(createNodeArray(argumentsArray)) : undefined;
        return node;
    }

    export function updateNew(node: NewExpression, expression: Expression, typeArguments: TypeNode[] | undefined, argumentsArray: Expression[] | undefined) {
        return node.expression !== expression
            || node.typeArguments !== typeArguments
            || node.arguments !== argumentsArray
            ? updateNode(createNew(expression, typeArguments, argumentsArray), node)
            : node;
    }

    export function createTaggedTemplate(tag: Expression, template: TemplateLiteral) {
        const node = <TaggedTemplateExpression>createSynthesizedNode(SyntaxKind.TaggedTemplateExpression);
        node.tag = parenthesizeForAccess(tag);
        node.template = template;
        return node;
    }

    export function updateTaggedTemplate(node: TaggedTemplateExpression, tag: Expression, template: TemplateLiteral) {
        return node.tag !== tag
            || node.template !== template
            ? updateNode(createTaggedTemplate(tag, template), node)
            : node;
    }

    export function createTypeAssertion(type: TypeNode, expression: Expression) {
        const node = <TypeAssertion>createSynthesizedNode(SyntaxKind.TypeAssertionExpression);
        node.type = type;
        node.expression = parenthesizePrefixOperand(expression);
        return node;
    }

    export function updateTypeAssertion(node: TypeAssertion, type: TypeNode, expression: Expression) {
        return node.type !== type
            || node.expression !== expression
            ? updateNode(createTypeAssertion(type, expression), node)
            : node;
    }

    export function createParen(expression: Expression) {
        const node = <ParenthesizedExpression>createSynthesizedNode(SyntaxKind.ParenthesizedExpression);
        node.expression = expression;
        return node;
    }

    export function updateParen(node: ParenthesizedExpression, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createParen(expression), node)
            : node;
    }

    export function createFunctionExpression(modifiers: Modifier[] | undefined, asteriskToken: AsteriskToken | undefined, name: string | Identifier | undefined, typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined, body: Block) {
        const node = <FunctionExpression>createSynthesizedNode(SyntaxKind.FunctionExpression);
        node.modifiers = asNodeArray(modifiers);
        node.asteriskToken = asteriskToken;
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.body = body;
        return node;
    }

    export function updateFunctionExpression(node: FunctionExpression, modifiers: Modifier[] | undefined, asteriskToken: AsteriskToken | undefined, name: Identifier | undefined, typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined, body: Block) {
        return node.name !== name
            || node.modifiers !== modifiers
            || node.asteriskToken !== asteriskToken
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            || node.body !== body
            ? updateNode(createFunctionExpression(modifiers, asteriskToken, name, typeParameters, parameters, type, body), node)
            : node;
    }

    export function createArrowFunction(modifiers: Modifier[] | undefined, typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined, equalsGreaterThanToken: EqualsGreaterThanToken | undefined, body: ConciseBody) {
        const node = <ArrowFunction>createSynthesizedNode(SyntaxKind.ArrowFunction);
        node.modifiers = asNodeArray(modifiers);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.equalsGreaterThanToken = equalsGreaterThanToken || createToken(SyntaxKind.EqualsGreaterThanToken);
        node.body = parenthesizeConciseBody(body);
        return node;
    }

    export function updateArrowFunction(node: ArrowFunction, modifiers: Modifier[] | undefined, typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined, body: ConciseBody) {
        return node.modifiers !== modifiers
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            || node.body !== body
            ? updateNode(createArrowFunction(modifiers, typeParameters, parameters, type, node.equalsGreaterThanToken, body), node)
            : node;
    }

    export function createDelete(expression: Expression) {
        const node = <DeleteExpression>createSynthesizedNode(SyntaxKind.DeleteExpression);
        node.expression = parenthesizePrefixOperand(expression);
        return node;
    }

    export function updateDelete(node: DeleteExpression, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createDelete(expression), node)
            : node;
    }

    export function createTypeOf(expression: Expression) {
        const node = <TypeOfExpression>createSynthesizedNode(SyntaxKind.TypeOfExpression);
        node.expression = parenthesizePrefixOperand(expression);
        return node;
    }

    export function updateTypeOf(node: TypeOfExpression, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createTypeOf(expression), node)
            : node;
    }

    export function createVoid(expression: Expression) {
        const node = <VoidExpression>createSynthesizedNode(SyntaxKind.VoidExpression);
        node.expression = parenthesizePrefixOperand(expression);
        return node;
    }

    export function updateVoid(node: VoidExpression, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createVoid(expression), node)
            : node;
    }

    export function createAwait(expression: Expression) {
        const node = <AwaitExpression>createSynthesizedNode(SyntaxKind.AwaitExpression);
        node.expression = parenthesizePrefixOperand(expression);
        return node;
    }

    export function updateAwait(node: AwaitExpression, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createAwait(expression), node)
            : node;
    }

    export function createPrefix(operator: PrefixUnaryOperator, operand: Expression) {
        const node = <PrefixUnaryExpression>createSynthesizedNode(SyntaxKind.PrefixUnaryExpression);
        node.operator = operator;
        node.operand = parenthesizePrefixOperand(operand);
        return node;
    }

    export function updatePrefix(node: PrefixUnaryExpression, operand: Expression) {
        return node.operand !== operand
            ? updateNode(createPrefix(node.operator, operand), node)
            : node;
    }

    export function createPostfix(operand: Expression, operator: PostfixUnaryOperator) {
        const node = <PostfixUnaryExpression>createSynthesizedNode(SyntaxKind.PostfixUnaryExpression);
        node.operand = parenthesizePostfixOperand(operand);
        node.operator = operator;
        return node;
    }

    export function updatePostfix(node: PostfixUnaryExpression, operand: Expression) {
        return node.operand !== operand
            ? updateNode(createPostfix(operand, node.operator), node)
            : node;
    }

    export function createBinary(left: Expression, operator: BinaryOperator | BinaryOperatorToken, right: Expression) {
        const node = <BinaryExpression>createSynthesizedNode(SyntaxKind.BinaryExpression);
        const operatorToken = asToken(operator);
        const operatorKind = operatorToken.kind;
        node.left = parenthesizeBinaryOperand(operatorKind, left, /*isLeftSideOfBinary*/ true, /*leftOperand*/ undefined);
        node.operatorToken = operatorToken;
        node.right = parenthesizeBinaryOperand(operatorKind, right, /*isLeftSideOfBinary*/ false, node.left);
        return node;
    }

    export function updateBinary(node: BinaryExpression, left: Expression, right: Expression) {
        return node.left !== left
            || node.right !== right
            ? updateNode(createBinary(left, node.operatorToken, right), node)
            : node;
    }

    export function createConditional(condition: Expression, whenTrue: Expression, whenFalse: Expression): ConditionalExpression;
    export function createConditional(condition: Expression, questionToken: QuestionToken, whenTrue: Expression, colonToken: ColonToken, whenFalse: Expression): ConditionalExpression;
    export function createConditional(condition: Expression, questionTokenOrWhenTrue: QuestionToken | Expression, whenTrueOrWhenFalse: Expression, colonToken?: ColonToken, whenFalse?: Expression) {
        const node = <ConditionalExpression>createSynthesizedNode(SyntaxKind.ConditionalExpression);
        node.condition = parenthesizeForConditionalHead(condition);
        node.questionToken = whenFalse ? <QuestionToken>questionTokenOrWhenTrue : createToken(SyntaxKind.QuestionToken);
        node.whenTrue = parenthesizeSubexpressionOfConditionalExpression(whenFalse ? whenTrueOrWhenFalse : <Expression>questionTokenOrWhenTrue);
        node.colonToken = whenFalse ? colonToken : createToken(SyntaxKind.ColonToken);
        node.whenFalse = parenthesizeSubexpressionOfConditionalExpression(whenFalse ? whenFalse : whenTrueOrWhenFalse);
        return node;
    }

    export function updateConditional(node: ConditionalExpression, condition: Expression, whenTrue: Expression, whenFalse: Expression) {
        return node.condition !== condition
            || node.whenTrue !== whenTrue
            || node.whenFalse !== whenFalse
            ? updateNode(createConditional(condition, node.questionToken, whenTrue, node.colonToken, whenFalse), node)
            : node;
    }

    export function createTemplateExpression(head: TemplateHead, templateSpans: TemplateSpan[]) {
        const node = <TemplateExpression>createSynthesizedNode(SyntaxKind.TemplateExpression);
        node.head = head;
        node.templateSpans = createNodeArray(templateSpans);
        return node;
    }

    export function updateTemplateExpression(node: TemplateExpression, head: TemplateHead, templateSpans: TemplateSpan[]) {
        return node.head !== head
            || node.templateSpans !== templateSpans
            ? updateNode(createTemplateExpression(head, templateSpans), node)
            : node;
    }

    export function createYield(expression?: Expression): YieldExpression;
    export function createYield(asteriskToken: AsteriskToken, expression: Expression): YieldExpression;
    export function createYield(asteriskTokenOrExpression?: AsteriskToken | Expression, expression?: Expression) {
        const node = <YieldExpression>createSynthesizedNode(SyntaxKind.YieldExpression);
        node.asteriskToken = asteriskTokenOrExpression && asteriskTokenOrExpression.kind === SyntaxKind.AsteriskToken ? <AsteriskToken>asteriskTokenOrExpression : undefined;
        node.expression = asteriskTokenOrExpression && asteriskTokenOrExpression.kind !== SyntaxKind.AsteriskToken ? <Expression>asteriskTokenOrExpression : expression;
        return node;
    }

    export function updateYield(node: YieldExpression, asteriskToken: AsteriskToken | undefined, expression: Expression) {
        return node.expression !== expression
            || node.asteriskToken !== asteriskToken
            ? updateNode(createYield(asteriskToken, expression), node)
            : node;
    }

    export function createSpread(expression: Expression) {
        const node = <SpreadElement>createSynthesizedNode(SyntaxKind.SpreadElement);
        node.expression = parenthesizeExpressionForList(expression);
        return node;
    }

    export function updateSpread(node: SpreadElement, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createSpread(expression), node)
            : node;
    }

    export function createClassExpression(modifiers: Modifier[] | undefined, name: string | Identifier | undefined, typeParameters: TypeParameterDeclaration[] | undefined, heritageClauses: HeritageClause[], members: ClassElement[]) {
        const node = <ClassExpression>createSynthesizedNode(SyntaxKind.ClassExpression);
        node.decorators = undefined;
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.heritageClauses = asNodeArray(heritageClauses);
        node.members = createNodeArray(members);
        return node;
    }

    export function updateClassExpression(node: ClassExpression, modifiers: Modifier[] | undefined, name: Identifier | undefined, typeParameters: TypeParameterDeclaration[] | undefined, heritageClauses: HeritageClause[], members: ClassElement[]) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.heritageClauses !== heritageClauses
            || node.members !== members
            ? updateNode(createClassExpression(modifiers, name, typeParameters, heritageClauses, members), node)
            : node;
    }

    export function createOmittedExpression() {
        return <OmittedExpression>createSynthesizedNode(SyntaxKind.OmittedExpression);
    }

    export function createExpressionWithTypeArguments(typeArguments: TypeNode[], expression: Expression) {
        const node = <ExpressionWithTypeArguments>createSynthesizedNode(SyntaxKind.ExpressionWithTypeArguments);
        node.expression = parenthesizeForAccess(expression);
        node.typeArguments = asNodeArray(typeArguments);
        return node;
    }

    export function updateExpressionWithTypeArguments(node: ExpressionWithTypeArguments, typeArguments: TypeNode[], expression: Expression) {
        return node.typeArguments !== typeArguments
            || node.expression !== expression
            ? updateNode(createExpressionWithTypeArguments(typeArguments, expression), node)
            : node;
    }

    export function createAsExpression(expression: Expression, type: TypeNode) {
        const node = <AsExpression>createSynthesizedNode(SyntaxKind.AsExpression);
        node.expression = expression;
        node.type = type;
        return node;
    }

    export function updateAsExpression(node: AsExpression, expression: Expression, type: TypeNode) {
        return node.expression !== expression
            || node.type !== type
            ? updateNode(createAsExpression(expression, type), node)
            : node;
    }

    export function createNonNullExpression(expression: Expression) {
        const node = <NonNullExpression>createSynthesizedNode(SyntaxKind.NonNullExpression);
        node.expression = parenthesizeForAccess(expression);
        return node;
    }

    export function updateNonNullExpression(node: NonNullExpression, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createNonNullExpression(expression), node)
            : node;
    }

    export function createMetaProperty(keywordToken: MetaProperty["keywordToken"], name: Identifier) {
        const node = <MetaProperty>createSynthesizedNode(SyntaxKind.MetaProperty);
        node.keywordToken = keywordToken;
        node.name = name;
        return node;
    }

    export function updateMetaProperty(node: MetaProperty, name: Identifier) {
        return node.name !== name
            ? updateNode(createMetaProperty(node.keywordToken, name), node)
            : node;
    }

    // Misc

    export function createTemplateSpan(expression: Expression, literal: TemplateMiddle | TemplateTail) {
        const node = <TemplateSpan>createSynthesizedNode(SyntaxKind.TemplateSpan);
        node.expression = expression;
        node.literal = literal;
        return node;
    }

    export function updateTemplateSpan(node: TemplateSpan, expression: Expression, literal: TemplateMiddle | TemplateTail) {
        return node.expression !== expression
            || node.literal !== literal
            ? updateNode(createTemplateSpan(expression, literal), node)
            : node;
    }

    export function createSemicolonClassElement() {
        return <SemicolonClassElement>createSynthesizedNode(SyntaxKind.SemicolonClassElement);
    }

    // Element

    export function createBlock(statements: Statement[], multiLine?: boolean): Block {
        const block = <Block>createSynthesizedNode(SyntaxKind.Block);
        block.statements = createNodeArray(statements);
        if (multiLine) block.multiLine = multiLine;
        return block;
    }

    export function updateBlock(node: Block, statements: Statement[]) {
        return node.statements !== statements
            ? updateNode(createBlock(statements, node.multiLine), node)
            : node;
    }

    export function createVariableStatement(modifiers: Modifier[] | undefined, declarationList: VariableDeclarationList | VariableDeclaration[]) {
        const node = <VariableStatement>createSynthesizedNode(SyntaxKind.VariableStatement);
        node.decorators = undefined;
        node.modifiers = asNodeArray(modifiers);
        node.declarationList = isArray(declarationList) ? createVariableDeclarationList(declarationList) : declarationList;
        return node;
    }

    export function updateVariableStatement(node: VariableStatement, modifiers: Modifier[] | undefined, declarationList: VariableDeclarationList) {
        return node.modifiers !== modifiers
            || node.declarationList !== declarationList
            ? updateNode(createVariableStatement(modifiers, declarationList), node)
            : node;
    }

    export function createEmptyStatement() {
        return <EmptyStatement>createSynthesizedNode(SyntaxKind.EmptyStatement);
    }

    export function createStatement(expression: Expression) {
        const node = <ExpressionStatement>createSynthesizedNode(SyntaxKind.ExpressionStatement);
        node.expression = parenthesizeExpressionForExpressionStatement(expression);
        return node;
    }

    export function updateStatement(node: ExpressionStatement, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createStatement(expression), node)
            : node;
    }

    export function createIf(expression: Expression, thenStatement: Statement, elseStatement?: Statement) {
        const node = <IfStatement>createSynthesizedNode(SyntaxKind.IfStatement);
        node.expression = expression;
        node.thenStatement = thenStatement;
        node.elseStatement = elseStatement;
        return node;
    }

    export function updateIf(node: IfStatement, expression: Expression, thenStatement: Statement, elseStatement: Statement | undefined) {
        return node.expression !== expression
            || node.thenStatement !== thenStatement
            || node.elseStatement !== elseStatement
            ? updateNode(createIf(expression, thenStatement, elseStatement), node)
            : node;
    }

    export function createDo(statement: Statement, expression: Expression) {
        const node = <DoStatement>createSynthesizedNode(SyntaxKind.DoStatement);
        node.statement = statement;
        node.expression = expression;
        return node;
    }

    export function updateDo(node: DoStatement, statement: Statement, expression: Expression) {
        return node.statement !== statement
            || node.expression !== expression
            ? updateNode(createDo(statement, expression), node)
            : node;
    }

    export function createWhile(expression: Expression, statement: Statement) {
        const node = <WhileStatement>createSynthesizedNode(SyntaxKind.WhileStatement);
        node.expression = expression;
        node.statement = statement;
        return node;
    }

    export function updateWhile(node: WhileStatement, expression: Expression, statement: Statement) {
        return node.expression !== expression
            || node.statement !== statement
            ? updateNode(createWhile(expression, statement), node)
            : node;
    }

    export function createFor(initializer: ForInitializer | undefined, condition: Expression | undefined, incrementor: Expression | undefined, statement: Statement) {
        const node = <ForStatement>createSynthesizedNode(SyntaxKind.ForStatement);
        node.initializer = initializer;
        node.condition = condition;
        node.incrementor = incrementor;
        node.statement = statement;
        return node;
    }

    export function updateFor(node: ForStatement, initializer: ForInitializer | undefined, condition: Expression | undefined, incrementor: Expression | undefined, statement: Statement) {
        return node.initializer !== initializer
            || node.condition !== condition
            || node.incrementor !== incrementor
            || node.statement !== statement
            ? updateNode(createFor(initializer, condition, incrementor, statement), node)
            : node;
    }

    export function createForIn(initializer: ForInitializer, expression: Expression, statement: Statement) {
        const node = <ForInStatement>createSynthesizedNode(SyntaxKind.ForInStatement);
        node.initializer = initializer;
        node.expression = expression;
        node.statement = statement;
        return node;
    }

    export function updateForIn(node: ForInStatement, initializer: ForInitializer, expression: Expression, statement: Statement) {
        return node.initializer !== initializer
            || node.expression !== expression
            || node.statement !== statement
            ? updateNode(createForIn(initializer, expression, statement), node)
            : node;
    }

    export function createForOf(awaitModifier: AwaitKeywordToken, initializer: ForInitializer, expression: Expression, statement: Statement) {
        const node = <ForOfStatement>createSynthesizedNode(SyntaxKind.ForOfStatement);
        node.awaitModifier = awaitModifier;
        node.initializer = initializer;
        node.expression = expression;
        node.statement = statement;
        return node;
    }

    export function updateForOf(node: ForOfStatement, awaitModifier: AwaitKeywordToken, initializer: ForInitializer, expression: Expression, statement: Statement) {
        return node.awaitModifier !== awaitModifier
            || node.initializer !== initializer
            || node.expression !== expression
            || node.statement !== statement
            ? updateNode(createForOf(awaitModifier, initializer, expression, statement), node)
            : node;
    }

    export function createContinue(label?: string | Identifier): ContinueStatement {
        const node = <ContinueStatement>createSynthesizedNode(SyntaxKind.ContinueStatement);
        node.label = asName(label);
        return node;
    }

    export function updateContinue(node: ContinueStatement, label: Identifier | undefined) {
        return node.label !== label
            ? updateNode(createContinue(label), node)
            : node;
    }

    export function createBreak(label?: string | Identifier): BreakStatement {
        const node = <BreakStatement>createSynthesizedNode(SyntaxKind.BreakStatement);
        node.label = asName(label);
        return node;
    }

    export function updateBreak(node: BreakStatement, label: Identifier | undefined) {
        return node.label !== label
            ? updateNode(createBreak(label), node)
            : node;
    }

    export function createReturn(expression?: Expression): ReturnStatement {
        const node = <ReturnStatement>createSynthesizedNode(SyntaxKind.ReturnStatement);
        node.expression = expression;
        return node;
    }

    export function updateReturn(node: ReturnStatement, expression: Expression | undefined) {
        return node.expression !== expression
            ? updateNode(createReturn(expression), node)
            : node;
    }

    export function createWith(expression: Expression, statement: Statement) {
        const node = <WithStatement>createSynthesizedNode(SyntaxKind.WithStatement);
        node.expression = expression;
        node.statement = statement;
        return node;
    }

    export function updateWith(node: WithStatement, expression: Expression, statement: Statement) {
        return node.expression !== expression
            || node.statement !== statement
            ? updateNode(createWith(expression, statement), node)
            : node;
    }

    export function createSwitch(expression: Expression, caseBlock: CaseBlock): SwitchStatement {
        const node = <SwitchStatement>createSynthesizedNode(SyntaxKind.SwitchStatement);
        node.expression = parenthesizeExpressionForList(expression);
        node.caseBlock = caseBlock;
        return node;
    }

    export function updateSwitch(node: SwitchStatement, expression: Expression, caseBlock: CaseBlock) {
        return node.expression !== expression
            || node.caseBlock !== caseBlock
            ? updateNode(createSwitch(expression, caseBlock), node)
            : node;
    }

    export function createLabel(label: string | Identifier, statement: Statement) {
        const node = <LabeledStatement>createSynthesizedNode(SyntaxKind.LabeledStatement);
        node.label = asName(label);
        node.statement = statement;
        return node;
    }

    export function updateLabel(node: LabeledStatement, label: Identifier, statement: Statement) {
        return node.label !== label
            || node.statement !== statement
            ? updateNode(createLabel(label, statement), node)
            : node;
    }

    export function createThrow(expression: Expression) {
        const node = <ThrowStatement>createSynthesizedNode(SyntaxKind.ThrowStatement);
        node.expression = expression;
        return node;
    }

    export function updateThrow(node: ThrowStatement, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createThrow(expression), node)
            : node;
    }

    export function createTry(tryBlock: Block, catchClause: CatchClause | undefined, finallyBlock: Block | undefined) {
        const node = <TryStatement>createSynthesizedNode(SyntaxKind.TryStatement);
        node.tryBlock = tryBlock;
        node.catchClause = catchClause;
        node.finallyBlock = finallyBlock;
        return node;
    }

    export function updateTry(node: TryStatement, tryBlock: Block, catchClause: CatchClause | undefined, finallyBlock: Block | undefined) {
        return node.tryBlock !== tryBlock
            || node.catchClause !== catchClause
            || node.finallyBlock !== finallyBlock
            ? updateNode(createTry(tryBlock, catchClause, finallyBlock), node)
            : node;
    }

    export function createDebuggerStatement() {
        return <DebuggerStatement>createSynthesizedNode(SyntaxKind.DebuggerStatement);
    }

    export function createVariableDeclaration(name: string | BindingName, type?: TypeNode, initializer?: Expression) {
        const node = <VariableDeclaration>createSynthesizedNode(SyntaxKind.VariableDeclaration);
        node.name = asName(name);
        node.type = type;
        node.initializer = initializer !== undefined ? parenthesizeExpressionForList(initializer) : undefined;
        return node;
    }

    export function updateVariableDeclaration(node: VariableDeclaration, name: BindingName, type: TypeNode | undefined, initializer: Expression | undefined) {
        return node.name !== name
            || node.type !== type
            || node.initializer !== initializer
            ? updateNode(createVariableDeclaration(name, type, initializer), node)
            : node;
    }

    export function createVariableDeclarationList(declarations: VariableDeclaration[], flags?: NodeFlags) {
        const node = <VariableDeclarationList>createSynthesizedNode(SyntaxKind.VariableDeclarationList);
        node.flags |= flags & NodeFlags.BlockScoped;
        node.declarations = createNodeArray(declarations);
        return node;
    }

    export function updateVariableDeclarationList(node: VariableDeclarationList, declarations: VariableDeclaration[]) {
        return node.declarations !== declarations
            ? updateNode(createVariableDeclarationList(declarations, node.flags), node)
            : node;
    }

    export function createFunctionDeclaration(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, asteriskToken: AsteriskToken | undefined, name: string | Identifier | undefined, typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined, body: Block | undefined) {
        const node = <FunctionDeclaration>createSynthesizedNode(SyntaxKind.FunctionDeclaration);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.asteriskToken = asteriskToken;
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.body = body;
        return node;
    }

    export function updateFunctionDeclaration(node: FunctionDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, asteriskToken: AsteriskToken | undefined, name: Identifier | undefined, typeParameters: TypeParameterDeclaration[] | undefined, parameters: ParameterDeclaration[], type: TypeNode | undefined, body: Block | undefined) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.asteriskToken !== asteriskToken
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            || node.body !== body
            ? updateNode(createFunctionDeclaration(decorators, modifiers, asteriskToken, name, typeParameters, parameters, type, body), node)
            : node;
    }

    export function createClassDeclaration(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: string | Identifier | undefined, typeParameters: TypeParameterDeclaration[] | undefined, heritageClauses: HeritageClause[], members: ClassElement[]) {
        const node = <ClassDeclaration>createSynthesizedNode(SyntaxKind.ClassDeclaration);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.heritageClauses = asNodeArray(heritageClauses);
        node.members = createNodeArray(members);
        return node;
    }

    export function updateClassDeclaration(node: ClassDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: Identifier | undefined, typeParameters: TypeParameterDeclaration[] | undefined, heritageClauses: HeritageClause[], members: ClassElement[]) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.heritageClauses !== heritageClauses
            || node.members !== members
            ? updateNode(createClassDeclaration(decorators, modifiers, name, typeParameters, heritageClauses, members), node)
            : node;
    }

    export function createInterfaceDeclaration(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: string | Identifier, typeParameters: TypeParameterDeclaration[] | undefined, heritageClauses: HeritageClause[] | undefined, members: TypeElement[]) {
        const node = <InterfaceDeclaration>createSynthesizedNode(SyntaxKind.InterfaceDeclaration);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.heritageClauses = asNodeArray(heritageClauses);
        node.members = createNodeArray(members);
        return node;
    }

    export function updateInterfaceDeclaration(node: InterfaceDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: Identifier, typeParameters: TypeParameterDeclaration[] | undefined, heritageClauses: HeritageClause[] | undefined, members: TypeElement[]) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.heritageClauses !== heritageClauses
            || node.members !== members
            ? updateNode(createInterfaceDeclaration(decorators, modifiers, name, typeParameters, heritageClauses, members), node)
            : node;
    }

    export function createTypeAliasDeclaration(name: string | Identifier, typeParameters: TypeParameterDeclaration[] | undefined, type: TypeNode) {
        const node = <TypeAliasDeclaration>createSynthesizedNode(SyntaxKind.TypeAliasDeclaration);
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.type = type;
        return node;
    }

    export function updateTypeAliasDeclaration(node: TypeAliasDeclaration, name: Identifier, typeParameters: TypeParameterDeclaration[] | undefined, type: TypeNode) {
        return node.name !== name
            || node.typeParameters !== typeParameters
            || node.type !== type
            ? updateNode(createTypeAliasDeclaration(name, typeParameters, type), node)
            : node;
    }

    export function createEnumDeclaration(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: string | Identifier, members: EnumMember[]) {
        const node = <EnumDeclaration>createSynthesizedNode(SyntaxKind.EnumDeclaration);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.members = createNodeArray(members);
        return node;
    }

    export function updateEnumDeclaration(node: EnumDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: Identifier, members: EnumMember[]) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.name !== name
            || node.members !== members
            ? updateNode(createEnumDeclaration(decorators, modifiers, name, members), node)
            : node;
    }

    export function createModuleDeclaration(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: ModuleName, body: ModuleBody | undefined, flags?: NodeFlags) {
        const node = <ModuleDeclaration>createSynthesizedNode(SyntaxKind.ModuleDeclaration);
        node.flags |= flags & (NodeFlags.Namespace | NodeFlags.NestedNamespace | NodeFlags.GlobalAugmentation);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.name = name;
        node.body = body;
        return node;
    }

    export function updateModuleDeclaration(node: ModuleDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: ModuleName, body: ModuleBody | undefined) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.name !== name
            || node.body !== body
            ? updateNode(createModuleDeclaration(decorators, modifiers, name, body, node.flags), node)
            : node;
    }

    export function createModuleBlock(statements: Statement[]) {
        const node = <ModuleBlock>createSynthesizedNode(SyntaxKind.ModuleBlock);
        node.statements = createNodeArray(statements);
        return node;
    }

    export function updateModuleBlock(node: ModuleBlock, statements: Statement[]) {
        return node.statements !== statements
            ? updateNode(createModuleBlock(statements), node)
            : node;
    }

    export function createCaseBlock(clauses: CaseOrDefaultClause[]): CaseBlock {
        const node = <CaseBlock>createSynthesizedNode(SyntaxKind.CaseBlock);
        node.clauses = createNodeArray(clauses);
        return node;
    }

    export function updateCaseBlock(node: CaseBlock, clauses: CaseOrDefaultClause[]) {
        return node.clauses !== clauses
            ? updateNode(createCaseBlock(clauses), node)
            : node;
    }

    export function createNamespaceExportDeclaration(name: string | Identifier) {
        const node = <NamespaceExportDeclaration>createSynthesizedNode(SyntaxKind.NamespaceExportDeclaration);
        node.name = asName(name);
        return node;
    }

    export function updateNamespaceExportDeclaration(node: NamespaceExportDeclaration, name: Identifier) {
        return node.name !== name
            ? updateNode(createNamespaceExportDeclaration(name), node)
            : node;
    }

    export function createImportEqualsDeclaration(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: string | Identifier, moduleReference: ModuleReference) {
        const node = <ImportEqualsDeclaration>createSynthesizedNode(SyntaxKind.ImportEqualsDeclaration);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.moduleReference = moduleReference;
        return node;
    }

    export function updateImportEqualsDeclaration(node: ImportEqualsDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, name: Identifier, moduleReference: ModuleReference) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.name !== name
            || node.moduleReference !== moduleReference
            ? updateNode(createImportEqualsDeclaration(decorators, modifiers, name, moduleReference), node)
            : node;
    }

    export function createImportDeclaration(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, importClause: ImportClause | undefined, moduleSpecifier?: Expression): ImportDeclaration {
        const node = <ImportDeclaration>createSynthesizedNode(SyntaxKind.ImportDeclaration);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.importClause = importClause;
        node.moduleSpecifier = moduleSpecifier;
        return node;
    }

    export function updateImportDeclaration(node: ImportDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, importClause: ImportClause | undefined, moduleSpecifier: Expression | undefined) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.importClause !== importClause
            || node.moduleSpecifier !== moduleSpecifier
            ? updateNode(createImportDeclaration(decorators, modifiers, importClause, moduleSpecifier), node)
            : node;
    }

    export function createImportClause(name: Identifier, namedBindings: NamedImportBindings): ImportClause {
        const node = <ImportClause>createSynthesizedNode(SyntaxKind.ImportClause);
        node.name = name;
        node.namedBindings = namedBindings;
        return node;
    }

    export function updateImportClause(node: ImportClause, name: Identifier, namedBindings: NamedImportBindings) {
        return node.name !== name
            || node.namedBindings !== namedBindings
            ? updateNode(createImportClause(name, namedBindings), node)
            : node;
    }

    export function createNamespaceImport(name: Identifier): NamespaceImport {
        const node = <NamespaceImport>createSynthesizedNode(SyntaxKind.NamespaceImport);
        node.name = name;
        return node;
    }

    export function updateNamespaceImport(node: NamespaceImport, name: Identifier) {
        return node.name !== name
            ? updateNode(createNamespaceImport(name), node)
            : node;
    }

    export function createNamedImports(elements: ImportSpecifier[]): NamedImports {
        const node = <NamedImports>createSynthesizedNode(SyntaxKind.NamedImports);
        node.elements = createNodeArray(elements);
        return node;
    }

    export function updateNamedImports(node: NamedImports, elements: ImportSpecifier[]) {
        return node.elements !== elements
            ? updateNode(createNamedImports(elements), node)
            : node;
    }

    export function createImportSpecifier(propertyName: Identifier | undefined, name: Identifier) {
        const node = <ImportSpecifier>createSynthesizedNode(SyntaxKind.ImportSpecifier);
        node.propertyName = propertyName;
        node.name = name;
        return node;
    }

    export function updateImportSpecifier(node: ImportSpecifier, propertyName: Identifier | undefined, name: Identifier) {
        return node.propertyName !== propertyName
            || node.name !== name
            ? updateNode(createImportSpecifier(propertyName, name), node)
            : node;
    }

    export function createExportAssignment(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, isExportEquals: boolean, expression: Expression) {
        const node = <ExportAssignment>createSynthesizedNode(SyntaxKind.ExportAssignment);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.isExportEquals = isExportEquals;
        node.expression = expression;
        return node;
    }

    export function updateExportAssignment(node: ExportAssignment, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, expression: Expression) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.expression !== expression
            ? updateNode(createExportAssignment(decorators, modifiers, node.isExportEquals, expression), node)
            : node;
    }

    export function createExportDeclaration(decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, exportClause: NamedExports | undefined, moduleSpecifier?: Expression) {
        const node = <ExportDeclaration>createSynthesizedNode(SyntaxKind.ExportDeclaration);
        node.decorators = asNodeArray(decorators);
        node.modifiers = asNodeArray(modifiers);
        node.exportClause = exportClause;
        node.moduleSpecifier = moduleSpecifier;
        return node;
    }

    export function updateExportDeclaration(node: ExportDeclaration, decorators: Decorator[] | undefined, modifiers: Modifier[] | undefined, exportClause: NamedExports | undefined, moduleSpecifier: Expression | undefined) {
        return node.decorators !== decorators
            || node.modifiers !== modifiers
            || node.exportClause !== exportClause
            || node.moduleSpecifier !== moduleSpecifier
            ? updateNode(createExportDeclaration(decorators, modifiers, exportClause, moduleSpecifier), node)
            : node;
    }

    export function createNamedExports(elements: ExportSpecifier[]) {
        const node = <NamedExports>createSynthesizedNode(SyntaxKind.NamedExports);
        node.elements = createNodeArray(elements);
        return node;
    }

    export function updateNamedExports(node: NamedExports, elements: ExportSpecifier[]) {
        return node.elements !== elements
            ? updateNode(createNamedExports(elements), node)
            : node;
    }

    export function createExportSpecifier(propertyName: string | Identifier | undefined, name: string | Identifier) {
        const node = <ExportSpecifier>createSynthesizedNode(SyntaxKind.ExportSpecifier);
        node.propertyName = asName(propertyName);
        node.name = asName(name);
        return node;
    }

    export function updateExportSpecifier(node: ExportSpecifier, propertyName: Identifier | undefined, name: Identifier) {
        return node.propertyName !== propertyName
            || node.name !== name
            ? updateNode(createExportSpecifier(propertyName, name), node)
            : node;
    }

    // Module references

    export function createExternalModuleReference(expression: Expression) {
        const node = <ExternalModuleReference>createSynthesizedNode(SyntaxKind.ExternalModuleReference);
        node.expression = expression;
        return node;
    }

    export function updateExternalModuleReference(node: ExternalModuleReference, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createExternalModuleReference(expression), node)
            : node;
    }

    // JSX

    export function createJsxElement(openingElement: JsxOpeningElement, children: JsxChild[], closingElement: JsxClosingElement) {
        const node = <JsxElement>createSynthesizedNode(SyntaxKind.JsxElement);
        node.openingElement = openingElement;
        node.children = createNodeArray(children);
        node.closingElement = closingElement;
        return node;
    }

    export function updateJsxElement(node: JsxElement, openingElement: JsxOpeningElement, children: JsxChild[], closingElement: JsxClosingElement) {
        return node.openingElement !== openingElement
            || node.children !== children
            || node.closingElement !== closingElement
            ? updateNode(createJsxElement(openingElement, children, closingElement), node)
            : node;
    }

    export function createJsxSelfClosingElement(tagName: JsxTagNameExpression, attributes: JsxAttributes) {
        const node = <JsxSelfClosingElement>createSynthesizedNode(SyntaxKind.JsxSelfClosingElement);
        node.tagName = tagName;
        node.attributes = attributes;
        return node;
    }

    export function updateJsxSelfClosingElement(node: JsxSelfClosingElement, tagName: JsxTagNameExpression, attributes: JsxAttributes) {
        return node.tagName !== tagName
            || node.attributes !== attributes
            ? updateNode(createJsxSelfClosingElement(tagName, attributes), node)
            : node;
    }

    export function createJsxOpeningElement(tagName: JsxTagNameExpression, attributes: JsxAttributes) {
        const node = <JsxOpeningElement>createSynthesizedNode(SyntaxKind.JsxOpeningElement);
        node.tagName = tagName;
        node.attributes = attributes;
        return node;
    }

    export function updateJsxOpeningElement(node: JsxOpeningElement, tagName: JsxTagNameExpression, attributes: JsxAttributes) {
        return node.tagName !== tagName
            || node.attributes !== attributes
            ? updateNode(createJsxOpeningElement(tagName, attributes), node)
            : node;
    }

    export function createJsxClosingElement(tagName: JsxTagNameExpression) {
        const node = <JsxClosingElement>createSynthesizedNode(SyntaxKind.JsxClosingElement);
        node.tagName = tagName;
        return node;
    }

    export function updateJsxClosingElement(node: JsxClosingElement, tagName: JsxTagNameExpression) {
        return node.tagName !== tagName
            ? updateNode(createJsxClosingElement(tagName), node)
            : node;
    }

    export function createJsxAttribute(name: Identifier, initializer: StringLiteral | JsxExpression) {
        const node = <JsxAttribute>createSynthesizedNode(SyntaxKind.JsxAttribute);
        node.name = name;
        node.initializer = initializer;
        return node;
    }

    export function updateJsxAttribute(node: JsxAttribute, name: Identifier, initializer: StringLiteral | JsxExpression) {
        return node.name !== name
            || node.initializer !== initializer
            ? updateNode(createJsxAttribute(name, initializer), node)
            : node;
    }

    export function createJsxAttributes(properties: JsxAttributeLike[]) {
        const node = <JsxAttributes>createSynthesizedNode(SyntaxKind.JsxAttributes);
        node.properties = createNodeArray(properties);
        return node;
    }

    export function updateJsxAttributes(node: JsxAttributes, properties: JsxAttributeLike[]) {
        return node.properties !== properties
            ? updateNode(createJsxAttributes(properties), node)
            : node;
    }

    export function createJsxSpreadAttribute(expression: Expression) {
        const node = <JsxSpreadAttribute>createSynthesizedNode(SyntaxKind.JsxSpreadAttribute);
        node.expression = expression;
        return node;
    }

    export function updateJsxSpreadAttribute(node: JsxSpreadAttribute, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createJsxSpreadAttribute(expression), node)
            : node;
    }

    export function createJsxExpression(dotDotDotToken: DotDotDotToken | undefined, expression: Expression | undefined) {
        const node = <JsxExpression>createSynthesizedNode(SyntaxKind.JsxExpression);
        node.dotDotDotToken = dotDotDotToken;
        node.expression = expression;
        return node;
    }

    export function updateJsxExpression(node: JsxExpression, expression: Expression | undefined) {
        return node.expression !== expression
            ? updateNode(createJsxExpression(node.dotDotDotToken, expression), node)
            : node;
    }

    // Clauses

    export function createCaseClause(expression: Expression, statements: Statement[]) {
        const node = <CaseClause>createSynthesizedNode(SyntaxKind.CaseClause);
        node.expression = parenthesizeExpressionForList(expression);
        node.statements = createNodeArray(statements);
        return node;
    }

    export function updateCaseClause(node: CaseClause, expression: Expression, statements: Statement[]) {
        return node.expression !== expression
            || node.statements !== statements
            ? updateNode(createCaseClause(expression, statements), node)
            : node;
    }

    export function createDefaultClause(statements: Statement[]) {
        const node = <DefaultClause>createSynthesizedNode(SyntaxKind.DefaultClause);
        node.statements = createNodeArray(statements);
        return node;
    }

    export function updateDefaultClause(node: DefaultClause, statements: Statement[]) {
        return node.statements !== statements
            ? updateNode(createDefaultClause(statements), node)
            : node;
    }

    export function createHeritageClause(token: HeritageClause["token"], types: ExpressionWithTypeArguments[]) {
        const node = <HeritageClause>createSynthesizedNode(SyntaxKind.HeritageClause);
        node.token = token;
        node.types = createNodeArray(types);
        return node;
    }

    export function updateHeritageClause(node: HeritageClause, types: ExpressionWithTypeArguments[]) {
        return node.types !== types
            ? updateNode(createHeritageClause(node.token, types), node)
            : node;
    }

    export function createCatchClause(variableDeclaration: string | VariableDeclaration, block: Block) {
        const node = <CatchClause>createSynthesizedNode(SyntaxKind.CatchClause);
        node.variableDeclaration = typeof variableDeclaration === "string" ? createVariableDeclaration(variableDeclaration) : variableDeclaration;
        node.block = block;
        return node;
    }

    export function updateCatchClause(node: CatchClause, variableDeclaration: VariableDeclaration, block: Block) {
        return node.variableDeclaration !== variableDeclaration
            || node.block !== block
            ? updateNode(createCatchClause(variableDeclaration, block), node)
            : node;
    }

    // Property assignments

    export function createPropertyAssignment(name: string | PropertyName, initializer: Expression) {
        const node = <PropertyAssignment>createSynthesizedNode(SyntaxKind.PropertyAssignment);
        node.name = asName(name);
        node.questionToken = undefined;
        node.initializer = initializer !== undefined ? parenthesizeExpressionForList(initializer) : undefined;
        return node;
    }

    export function updatePropertyAssignment(node: PropertyAssignment, name: PropertyName, initializer: Expression) {
        return node.name !== name
            || node.initializer !== initializer
            ? updateNode(createPropertyAssignment(name, initializer), node)
            : node;
    }

    export function createShorthandPropertyAssignment(name: string | Identifier, objectAssignmentInitializer?: Expression) {
        const node = <ShorthandPropertyAssignment>createSynthesizedNode(SyntaxKind.ShorthandPropertyAssignment);
        node.name = asName(name);
        node.objectAssignmentInitializer = objectAssignmentInitializer !== undefined ? parenthesizeExpressionForList(objectAssignmentInitializer) : undefined;
        return node;
    }

    export function updateShorthandPropertyAssignment(node: ShorthandPropertyAssignment, name: Identifier, objectAssignmentInitializer: Expression | undefined) {
        return node.name !== name
            || node.objectAssignmentInitializer !== objectAssignmentInitializer
            ? updateNode(createShorthandPropertyAssignment(name, objectAssignmentInitializer), node)
            : node;
    }

    export function createSpreadAssignment(expression: Expression) {
        const node = <SpreadAssignment>createSynthesizedNode(SyntaxKind.SpreadAssignment);
        node.expression = expression !== undefined ? parenthesizeExpressionForList(expression) : undefined;
        return node;
    }

    export function updateSpreadAssignment(node: SpreadAssignment, expression: Expression) {
        return node.expression !== expression
            ? updateNode(createSpreadAssignment(expression), node)
            : node;
    }

    // Enum

    export function createEnumMember(name: string | PropertyName, initializer?: Expression) {
        const node = <EnumMember>createSynthesizedNode(SyntaxKind.EnumMember);
        node.name = asName(name);
        node.initializer = initializer && parenthesizeExpressionForList(initializer);
        return node;
    }

    export function updateEnumMember(node: EnumMember, name: PropertyName, initializer: Expression | undefined) {
        return node.name !== name
            || node.initializer !== initializer
            ? updateNode(createEnumMember(name, initializer), node)
            : node;
    }

    // Top-level nodes

    export function updateSourceFileNode(node: SourceFile, statements: Statement[]) {
        if (node.statements !== statements) {
            const updated = <SourceFile>createSynthesizedNode(SyntaxKind.SourceFile);
            updated.flags |= node.flags;
            updated.statements = createNodeArray(statements);
            updated.endOfFileToken = node.endOfFileToken;
            updated.fileName = node.fileName;
            updated.path = node.path;
            updated.text = node.text;
            if (node.amdDependencies !== undefined) updated.amdDependencies = node.amdDependencies;
            if (node.moduleName !== undefined) updated.moduleName = node.moduleName;
            if (node.referencedFiles !== undefined) updated.referencedFiles = node.referencedFiles;
            if (node.typeReferenceDirectives !== undefined) updated.typeReferenceDirectives = node.typeReferenceDirectives;
            if (node.languageVariant !== undefined) updated.languageVariant = node.languageVariant;
            if (node.isDeclarationFile !== undefined) updated.isDeclarationFile = node.isDeclarationFile;
            if (node.renamedDependencies !== undefined) updated.renamedDependencies = node.renamedDependencies;
            if (node.hasNoDefaultLib !== undefined) updated.hasNoDefaultLib = node.hasNoDefaultLib;
            if (node.languageVersion !== undefined) updated.languageVersion = node.languageVersion;
            if (node.scriptKind !== undefined) updated.scriptKind = node.scriptKind;
            if (node.externalModuleIndicator !== undefined) updated.externalModuleIndicator = node.externalModuleIndicator;
            if (node.commonJsModuleIndicator !== undefined) updated.commonJsModuleIndicator = node.commonJsModuleIndicator;
            if (node.identifiers !== undefined) updated.identifiers = node.identifiers;
            if (node.nodeCount !== undefined) updated.nodeCount = node.nodeCount;
            if (node.identifierCount !== undefined) updated.identifierCount = node.identifierCount;
            if (node.symbolCount !== undefined) updated.symbolCount = node.symbolCount;
            if (node.parseDiagnostics !== undefined) updated.parseDiagnostics = node.parseDiagnostics;
            if (node.bindDiagnostics !== undefined) updated.bindDiagnostics = node.bindDiagnostics;
            if (node.lineMap !== undefined) updated.lineMap = node.lineMap;
            if (node.classifiableNames !== undefined) updated.classifiableNames = node.classifiableNames;
            if (node.resolvedModules !== undefined) updated.resolvedModules = node.resolvedModules;
            if (node.resolvedTypeReferenceDirectiveNames !== undefined) updated.resolvedTypeReferenceDirectiveNames = node.resolvedTypeReferenceDirectiveNames;
            if (node.imports !== undefined) updated.imports = node.imports;
            if (node.moduleAugmentations !== undefined) updated.moduleAugmentations = node.moduleAugmentations;
            return updateNode(updated, node);
        }

        return node;
    }

    /**
     * Creates a shallow, memberwise clone of a node for mutation.
     */
    export function getMutableClone<T extends Node>(node: T): T {
        const clone = getSynthesizedClone(node);
        clone.pos = node.pos;
        clone.end = node.end;
        clone.parent = node.parent;
        return clone;
    }

    // Transformation nodes

    /**
     * Creates a synthetic statement to act as a placeholder for a not-emitted statement in
     * order to preserve comments.
     *
     * @param original The original statement.
     */
    export function createNotEmittedStatement(original: Node) {
        const node = <NotEmittedStatement>createSynthesizedNode(SyntaxKind.NotEmittedStatement);
        node.original = original;
        setTextRange(node, original);
        return node;
    }

    /**
     * Creates a synthetic element to act as a placeholder for the end of an emitted declaration in
     * order to properly emit exports.
     */
    /* @internal */
    export function createEndOfDeclarationMarker(original: Node) {
        const node = <EndOfDeclarationMarker>createSynthesizedNode(SyntaxKind.EndOfDeclarationMarker);
        node.emitNode = {};
        node.original = original;
        return node;
    }

    /**
     * Creates a synthetic element to act as a placeholder for the beginning of a merged declaration in
     * order to properly emit exports.
     */
    /* @internal */
    export function createMergeDeclarationMarker(original: Node) {
        const node = <MergeDeclarationMarker>createSynthesizedNode(SyntaxKind.MergeDeclarationMarker);
        node.emitNode = {};
        node.original = original;
        return node;
    }

    /**
     * Creates a synthetic expression to act as a placeholder for a not-emitted expression in
     * order to preserve comments or sourcemap positions.
     *
     * @param expression The inner expression to emit.
     * @param original The original outer expression.
     * @param location The location for the expression. Defaults to the positions from "original" if provided.
     */
    export function createPartiallyEmittedExpression(expression: Expression, original?: Node) {
        const node = <PartiallyEmittedExpression>createSynthesizedNode(SyntaxKind.PartiallyEmittedExpression);
        node.expression = expression;
        node.original = original;
        setTextRange(node, original);
        return node;
    }

    export function updatePartiallyEmittedExpression(node: PartiallyEmittedExpression, expression: Expression) {
        if (node.expression !== expression) {
            return updateNode(createPartiallyEmittedExpression(expression, node.original), node);
        }
        return node;
    }

    function flattenCommaElements(node: Expression): Expression | Expression[] {
        if (nodeIsSynthesized(node) && !isParseTreeNode(node) && !node.original && !node.emitNode && !node.id) {
            if (node.kind === SyntaxKind.CommaListExpression) {
                return (<CommaListExpression>node).elements;
            }
            if (isBinaryExpression(node) && node.operatorToken.kind === SyntaxKind.CommaToken) {
                return [node.left, node.right];
            }
        }
        return node;
    }

    export function createCommaList(elements: Expression[]) {
        const node = <CommaListExpression>createSynthesizedNode(SyntaxKind.CommaListExpression);
        node.elements = createNodeArray(sameFlatMap(elements, flattenCommaElements));
        return node;
    }

    export function updateCommaList(node: CommaListExpression, elements: Expression[]) {
        return node.elements !== elements
            ? updateNode(createCommaList(elements), node)
            : node;
    }

    export function createBundle(sourceFiles: SourceFile[]) {
        const node = <Bundle>createNode(SyntaxKind.Bundle);
        node.sourceFiles = sourceFiles;
        return node;
    }

    export function updateBundle(node: Bundle, sourceFiles: SourceFile[]) {
        if (node.sourceFiles !== sourceFiles) {
            return createBundle(sourceFiles);
        }
        return node;
    }

    // Compound nodes

    export function createComma(left: Expression, right: Expression) {
        return <Expression>createBinary(left, SyntaxKind.CommaToken, right);
    }

    export function createLessThan(left: Expression, right: Expression) {
        return <Expression>createBinary(left, SyntaxKind.LessThanToken, right);
    }

    export function createAssignment(left: ObjectLiteralExpression | ArrayLiteralExpression, right: Expression): DestructuringAssignment;
    export function createAssignment(left: Expression, right: Expression): BinaryExpression;
    export function createAssignment(left: Expression, right: Expression) {
        return createBinary(left, SyntaxKind.EqualsToken, right);
    }

    export function createStrictEquality(left: Expression, right: Expression) {
        return createBinary(left, SyntaxKind.EqualsEqualsEqualsToken, right);
    }

    export function createStrictInequality(left: Expression, right: Expression) {
        return createBinary(left, SyntaxKind.ExclamationEqualsEqualsToken, right);
    }

    export function createAdd(left: Expression, right: Expression) {
        return createBinary(left, SyntaxKind.PlusToken, right);
    }

    export function createSubtract(left: Expression, right: Expression) {
        return createBinary(left, SyntaxKind.MinusToken, right);
    }

    export function createPostfixIncrement(operand: Expression) {
        return createPostfix(operand, SyntaxKind.PlusPlusToken);
    }

    export function createLogicalAnd(left: Expression, right: Expression) {
        return createBinary(left, SyntaxKind.AmpersandAmpersandToken, right);
    }

    export function createLogicalOr(left: Expression, right: Expression) {
        return createBinary(left, SyntaxKind.BarBarToken, right);
    }

    export function createLogicalNot(operand: Expression) {
        return createPrefix(SyntaxKind.ExclamationToken, operand);
    }

    export function createVoidZero() {
        return createVoid(createLiteral(0));
    }

    export function createExportDefault(expression: Expression) {
        return createExportAssignment(/*decorators*/ undefined, /*modifiers*/ undefined, /*isExportEquals*/ false, expression);
    }

    export function createExternalModuleExport(exportName: Identifier) {
        return createExportDeclaration(/*decorators*/ undefined, /*modifiers*/ undefined, createNamedExports([createExportSpecifier(/*propertyName*/ undefined, exportName)]));
    }

    // Utilities

    function asName(name: string | Identifier): Identifier;
    function asName(name: string | BindingName): BindingName;
    function asName(name: string | PropertyName): PropertyName;
    function asName(name: string | EntityName): EntityName;
    function asName(name: string | Identifier | ThisTypeNode): Identifier | ThisTypeNode;
    function asName(name: string | Identifier | BindingName | PropertyName | QualifiedName | ThisTypeNode) {
        return typeof name === "string" ? createIdentifier(name) : name;
    }

    function asExpression(value: string | number | Expression) {
        return typeof value === "string" || typeof value === "number" ? createLiteral(value) : value;
    }

    function asNodeArray<T extends Node>(array: T[] | undefined): NodeArray<T> | undefined {
        return array ? createNodeArray(array) : undefined;
    }

    function asToken<TKind extends SyntaxKind>(value: TKind | Token<TKind>): Token<TKind> {
        return typeof value === "number" ? createToken(value) : value;
    }

    /**
     * Clears any EmitNode entries from parse-tree nodes.
     * @param sourceFile A source file.
     */
    export function disposeEmitNodes(sourceFile: SourceFile) {
        // During transformation we may need to annotate a parse tree node with transient
        // transformation properties. As parse tree nodes live longer than transformation
        // nodes, we need to make sure we reclaim any memory allocated for custom ranges
        // from these nodes to ensure we do not hold onto entire subtrees just for position
        // information. We also need to reset these nodes to a pre-transformation state
        // for incremental parsing scenarios so that we do not impact later emit.
        sourceFile = getSourceFileOfNode(getParseTreeNode(sourceFile));
        const emitNode = sourceFile && sourceFile.emitNode;
        const annotatedNodes = emitNode && emitNode.annotatedNodes;
        if (annotatedNodes) {
            for (const node of annotatedNodes) {
                node.emitNode = undefined;
            }
        }
    }

    /**
     * Associates a node with the current transformation, initializing
     * various transient transformation properties.
     */
    /* @internal */
    export function getOrCreateEmitNode(node: Node) {
        if (!node.emitNode) {
            if (isParseTreeNode(node)) {
                // To avoid holding onto transformation artifacts, we keep track of any
                // parse tree node we are annotating. This allows us to clean them up after
                // all transformations have completed.
                if (node.kind === SyntaxKind.SourceFile) {
                    return node.emitNode = { annotatedNodes: [node] };
                }

                const sourceFile = getSourceFileOfNode(node);
                getOrCreateEmitNode(sourceFile).annotatedNodes.push(node);
            }

            node.emitNode = {};
        }

        return node.emitNode;
    }

    export function setTextRange<T extends TextRange>(range: T, location: TextRange | undefined): T {
        if (location) {
            range.pos = location.pos;
            range.end = location.end;
        }
        return range;
    }

    /**
     * Gets flags that control emit behavior of a node.
     */
    export function getEmitFlags(node: Node): EmitFlags | undefined {
        const emitNode = node.emitNode;
        return emitNode && emitNode.flags;
    }

    /**
     * Sets flags that control emit behavior of a node.
     */
    export function setEmitFlags<T extends Node>(node: T, emitFlags: EmitFlags) {
        getOrCreateEmitNode(node).flags = emitFlags;
        return node;
    }

    /**
     * Gets a custom text range to use when emitting source maps.
     */
    export function getSourceMapRange(node: Node) {
        const emitNode = node.emitNode;
        return (emitNode && emitNode.sourceMapRange) || node;
    }

    /**
     * Sets a custom text range to use when emitting source maps.
     */
    export function setSourceMapRange<T extends Node>(node: T, range: TextRange | undefined) {
        getOrCreateEmitNode(node).sourceMapRange = range;
        return node;
    }

    /**
     * Gets the TextRange to use for source maps for a token of a node.
     */
    export function getTokenSourceMapRange(node: Node, token: SyntaxKind): TextRange | undefined {
        const emitNode = node.emitNode;
        const tokenSourceMapRanges = emitNode && emitNode.tokenSourceMapRanges;
        return tokenSourceMapRanges && tokenSourceMapRanges[token];
    }

    /**
     * Sets the TextRange to use for source maps for a token of a node.
     */
    export function setTokenSourceMapRange<T extends Node>(node: T, token: SyntaxKind, range: TextRange | undefined) {
        const emitNode = getOrCreateEmitNode(node);
        const tokenSourceMapRanges = emitNode.tokenSourceMapRanges || (emitNode.tokenSourceMapRanges = []);
        tokenSourceMapRanges[token] = range;
        return node;
    }

    /**
     * Gets a custom text range to use when emitting comments.
     */
    export function getCommentRange(node: Node) {
        const emitNode = node.emitNode;
        return (emitNode && emitNode.commentRange) || node;
    }

    /**
     * Sets a custom text range to use when emitting comments.
     */
    export function setCommentRange<T extends Node>(node: T, range: TextRange) {
        getOrCreateEmitNode(node).commentRange = range;
        return node;
    }

    export function getSyntheticLeadingComments(node: Node): SynthesizedComment[] | undefined {
        const emitNode = node.emitNode;
        return emitNode && emitNode.leadingComments;
    }

    export function setSyntheticLeadingComments<T extends Node>(node: T, comments: SynthesizedComment[]) {
        getOrCreateEmitNode(node).leadingComments = comments;
        return node;
    }

    export function addSyntheticLeadingComment<T extends Node>(node: T, kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia, text: string, hasTrailingNewLine?: boolean) {
        return setSyntheticLeadingComments(node, append(getSyntheticLeadingComments(node), <SynthesizedComment>{ kind, pos: -1, end: -1, hasTrailingNewLine, text }));
    }

    export function getSyntheticTrailingComments(node: Node): SynthesizedComment[] | undefined {
        const emitNode = node.emitNode;
        return emitNode && emitNode.trailingComments;
    }

    export function setSyntheticTrailingComments<T extends Node>(node: T, comments: SynthesizedComment[]) {
        getOrCreateEmitNode(node).trailingComments = comments;
        return node;
    }

    export function addSyntheticTrailingComment<T extends Node>(node: T, kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia, text: string, hasTrailingNewLine?: boolean) {
        return setSyntheticTrailingComments(node, append(getSyntheticTrailingComments(node), <SynthesizedComment>{ kind, pos: -1, end: -1, hasTrailingNewLine, text }));
    }

    /**
     * Gets the constant value to emit for an expression.
     */
    export function getConstantValue(node: PropertyAccessExpression | ElementAccessExpression) {
        const emitNode = node.emitNode;
        return emitNode && emitNode.constantValue;
    }

    /**
     * Sets the constant value to emit for an expression.
     */
    export function setConstantValue(node: PropertyAccessExpression | ElementAccessExpression, value: number) {
        const emitNode = getOrCreateEmitNode(node);
        emitNode.constantValue = value;
        return node;
    }

    /**
     * Adds an EmitHelper to a node.
     */
    export function addEmitHelper<T extends Node>(node: T, helper: EmitHelper): T {
        const emitNode = getOrCreateEmitNode(node);
        emitNode.helpers = append(emitNode.helpers, helper);
        return node;
    }

    /**
     * Add EmitHelpers to a node.
     */
    export function addEmitHelpers<T extends Node>(node: T, helpers: EmitHelper[] | undefined): T {
        if (some(helpers)) {
            const emitNode = getOrCreateEmitNode(node);
            for (const helper of helpers) {
                if (!contains(emitNode.helpers, helper)) {
                    emitNode.helpers = append(emitNode.helpers, helper);
                }
            }
        }
        return node;
    }

    /**
     * Removes an EmitHelper from a node.
     */
    export function removeEmitHelper(node: Node, helper: EmitHelper): boolean {
        const emitNode = node.emitNode;
        if (emitNode) {
            const helpers = emitNode.helpers;
            if (helpers) {
                return orderedRemoveItem(helpers, helper);
            }
        }
        return false;
    }

    /**
     * Gets the EmitHelpers of a node.
     */
    export function getEmitHelpers(node: Node): EmitHelper[] | undefined {
        const emitNode = node.emitNode;
        return emitNode && emitNode.helpers;
    }

    /**
     * Moves matching emit helpers from a source node to a target node.
     */
    export function moveEmitHelpers(source: Node, target: Node, predicate: (helper: EmitHelper) => boolean) {
        const sourceEmitNode = source.emitNode;
        const sourceEmitHelpers = sourceEmitNode && sourceEmitNode.helpers;
        if (!some(sourceEmitHelpers)) return;

        const targetEmitNode = getOrCreateEmitNode(target);
        let helpersRemoved = 0;
        for (let i = 0; i < sourceEmitHelpers.length; i++) {
            const helper = sourceEmitHelpers[i];
            if (predicate(helper)) {
                helpersRemoved++;
                if (!contains(targetEmitNode.helpers, helper)) {
                    targetEmitNode.helpers = append(targetEmitNode.helpers, helper);
                }
            }
            else if (helpersRemoved > 0) {
                sourceEmitHelpers[i - helpersRemoved] = helper;
            }
        }

        if (helpersRemoved > 0) {
            sourceEmitHelpers.length -= helpersRemoved;
        }
    }

    /* @internal */
    export function compareEmitHelpers(x: EmitHelper, y: EmitHelper) {
        if (x === y) return Comparison.EqualTo;
        if (x.priority === y.priority) return Comparison.EqualTo;
        if (x.priority === undefined) return Comparison.GreaterThan;
        if (y.priority === undefined) return Comparison.LessThan;
        return compareValues(x.priority, y.priority);
    }

    export function setOriginalNode<T extends Node>(node: T, original: Node | undefined): T {
        node.original = original;
        if (original) {
            const emitNode = original.emitNode;
            if (emitNode) node.emitNode = mergeEmitNode(emitNode, node.emitNode);
        }
        return node;
    }

    function mergeEmitNode(sourceEmitNode: EmitNode, destEmitNode: EmitNode) {
        const {
            flags,
            leadingComments,
            trailingComments,
            commentRange,
            sourceMapRange,
            tokenSourceMapRanges,
            constantValue,
            helpers
        } = sourceEmitNode;
        if (!destEmitNode) destEmitNode = {};
        if (leadingComments) destEmitNode.leadingComments = addRange(leadingComments.slice(), destEmitNode.leadingComments);
        if (trailingComments) destEmitNode.trailingComments = addRange(trailingComments.slice(), destEmitNode.trailingComments);
        if (flags) destEmitNode.flags = flags;
        if (commentRange) destEmitNode.commentRange = commentRange;
        if (sourceMapRange) destEmitNode.sourceMapRange = sourceMapRange;
        if (tokenSourceMapRanges) destEmitNode.tokenSourceMapRanges = mergeTokenSourceMapRanges(tokenSourceMapRanges, destEmitNode.tokenSourceMapRanges);
        if (constantValue !== undefined) destEmitNode.constantValue = constantValue;
        if (helpers) destEmitNode.helpers = addRange(destEmitNode.helpers, helpers);
        return destEmitNode;
    }

    function mergeTokenSourceMapRanges(sourceRanges: TextRange[], destRanges: TextRange[]) {
        if (!destRanges) destRanges = [];
        for (const key in sourceRanges) {
            destRanges[key] = sourceRanges[key];
        }
        return destRanges;
    }
}

/* @internal */
namespace ts {

    // Compound nodes

    export type TypeOfTag = "undefined" | "number" | "boolean" | "string" | "symbol" | "object" | "function";

    export function createTypeCheck(value: Expression, tag: TypeOfTag) {
        return tag === "undefined"
            ? createStrictEquality(value, createVoidZero())
            : createStrictEquality(createTypeOf(value), createLiteral(tag));
    }

    export function createMemberAccessForPropertyName(target: Expression, memberName: PropertyName, location?: TextRange): MemberExpression {
        if (isComputedPropertyName(memberName)) {
             return setTextRange(createElementAccess(target, memberName.expression), location);
        }
        else {
            const expression = setTextRange(
                isIdentifier(memberName)
                    ? createPropertyAccess(target, memberName)
                    : createElementAccess(target, memberName),
                memberName
            );
            getOrCreateEmitNode(expression).flags |= EmitFlags.NoNestedSourceMaps;
            return expression;
        }
    }

    export function createFunctionCall(func: Expression, thisArg: Expression, argumentsList: Expression[], location?: TextRange) {
        return setTextRange(
            createCall(
                createPropertyAccess(func, "call"),
                /*typeArguments*/ undefined,
                [
                    thisArg,
                    ...argumentsList
                ]),
            location
        );
    }

    export function createFunctionApply(func: Expression, thisArg: Expression, argumentsExpression: Expression, location?: TextRange) {
        return setTextRange(
            createCall(
                createPropertyAccess(func, "apply"),
                /*typeArguments*/ undefined,
                [
                    thisArg,
                    argumentsExpression
                ]
            ),
            location
        );
    }

    export function createArraySlice(array: Expression, start?: number | Expression) {
        const argumentsList: Expression[] = [];
        if (start !== undefined) {
            argumentsList.push(typeof start === "number" ? createLiteral(start) : start);
        }

        return createCall(createPropertyAccess(array, "slice"), /*typeArguments*/ undefined, argumentsList);
    }

    export function createArrayConcat(array: Expression, values: Expression[]) {
        return createCall(
            createPropertyAccess(array, "concat"),
            /*typeArguments*/ undefined,
            values
        );
    }

    export function createMathPow(left: Expression, right: Expression, location?: TextRange) {
        return setTextRange(
            createCall(
                createPropertyAccess(createIdentifier("Math"), "pow"),
                /*typeArguments*/ undefined,
                [left, right]
            ),
            location
        );
    }

    function createReactNamespace(reactNamespace: string, parent: JsxOpeningLikeElement) {
        // To ensure the emit resolver can properly resolve the namespace, we need to
        // treat this identifier as if it were a source tree node by clearing the `Synthesized`
        // flag and setting a parent node.
        const react = createIdentifier(reactNamespace || "React");
        react.flags &= ~NodeFlags.Synthesized;
        // Set the parent that is in parse tree
        // this makes sure that parent chain is intact for checker to traverse complete scope tree
        react.parent = getParseTreeNode(parent);
        return react;
    }

    function createJsxFactoryExpressionFromEntityName(jsxFactory: EntityName, parent: JsxOpeningLikeElement): Expression {
        if (isQualifiedName(jsxFactory)) {
            const left = createJsxFactoryExpressionFromEntityName(jsxFactory.left, parent);
            const right = createIdentifier(jsxFactory.right.text);
            right.text = jsxFactory.right.text;
            return createPropertyAccess(left, right);
        }
        else {
            return createReactNamespace(jsxFactory.text, parent);
        }
    }

    function createJsxFactoryExpression(jsxFactoryEntity: EntityName, reactNamespace: string, parent: JsxOpeningLikeElement): Expression {
        return jsxFactoryEntity ?
            createJsxFactoryExpressionFromEntityName(jsxFactoryEntity, parent) :
            createPropertyAccess(
                createReactNamespace(reactNamespace, parent),
                "createElement"
            );
    }

    export function createExpressionForJsxElement(jsxFactoryEntity: EntityName, reactNamespace: string, tagName: Expression, props: Expression, children: Expression[], parentElement: JsxOpeningLikeElement, location: TextRange): LeftHandSideExpression {
        const argumentsList = [tagName];
        if (props) {
            argumentsList.push(props);
        }

        if (children && children.length > 0) {
            if (!props) {
                argumentsList.push(createNull());
            }

            if (children.length > 1) {
                for (const child of children) {
                    child.startsOnNewLine = true;
                    argumentsList.push(child);
                }
            }
            else {
                argumentsList.push(children[0]);
            }
        }

        return setTextRange(
            createCall(
                createJsxFactoryExpression(jsxFactoryEntity, reactNamespace, parentElement),
                /*typeArguments*/ undefined,
                argumentsList
            ),
            location
        );
    }

    // Helpers

    export function getHelperName(name: string) {
        return setEmitFlags(createIdentifier(name), EmitFlags.HelperName | EmitFlags.AdviseOnEmitNode);
    }

    const valuesHelper: EmitHelper = {
        name: "typescript:values",
        scoped: false,
        text: `
            var __values = (this && this.__values) || function (o) {
                var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
                if (m) return m.call(o);
                return {
                    next: function () {
                        if (o && i >= o.length) o = void 0;
                        return { value: o && o[i++], done: !o };
                    }
                };
            };
        `
    };

    export function createValuesHelper(context: TransformationContext, expression: Expression, location?: TextRange) {
        context.requestEmitHelper(valuesHelper);
        return setTextRange(
            createCall(
                getHelperName("__values"),
                /*typeArguments*/ undefined,
                [expression]
            ),
            location
        );
    }

    const readHelper: EmitHelper = {
        name: "typescript:read",
        scoped: false,
        text: `
            var __read = (this && this.__read) || function (o, n) {
                var m = typeof Symbol === "function" && o[Symbol.iterator];
                if (!m) return o;
                var i = m.call(o), r, ar = [], e;
                try {
                    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
                }
                catch (error) { e = { error: error }; }
                finally {
                    try {
                        if (r && !r.done && (m = i["return"])) m.call(i);
                    }
                    finally { if (e) throw e.error; }
                }
                return ar;
            };
        `
    };

    export function createReadHelper(context: TransformationContext, iteratorRecord: Expression, count: number | undefined, location?: TextRange) {
        context.requestEmitHelper(readHelper);
        return setTextRange(
            createCall(
                getHelperName("__read"),
                /*typeArguments*/ undefined,
                count !== undefined
                    ? [iteratorRecord, createLiteral(count)]
                    : [iteratorRecord]
            ),
            location
        );
    }

    const spreadHelper: EmitHelper = {
        name: "typescript:spread",
        scoped: false,
        text: `
            var __spread = (this && this.__spread) || function () {
                for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
                return ar;
            };`
    };

    export function createSpreadHelper(context: TransformationContext, argumentList: Expression[], location?: TextRange) {
        context.requestEmitHelper(readHelper);
        context.requestEmitHelper(spreadHelper);
        return setTextRange(
            createCall(
                getHelperName("__spread"),
                /*typeArguments*/ undefined,
                argumentList
            ),
            location
        );
    }

    // Utilities

    export function createForOfBindingStatement(node: ForInitializer, boundValue: Expression): Statement {
        if (isVariableDeclarationList(node)) {
            const firstDeclaration = firstOrUndefined(node.declarations);
            const updatedDeclaration = updateVariableDeclaration(
                firstDeclaration,
                firstDeclaration.name,
                /*typeNode*/ undefined,
                boundValue
            );
            return setTextRange(
                createVariableStatement(
                    /*modifiers*/ undefined,
                    updateVariableDeclarationList(node, [updatedDeclaration])
                ),
                /*location*/ node
            );
        }
        else {
            const updatedExpression = setTextRange(createAssignment(node, boundValue), /*location*/ node);
            return setTextRange(createStatement(updatedExpression), /*location*/ node);
        }
    }

    export function insertLeadingStatement(dest: Statement, source: Statement) {
        if (isBlock(dest)) {
            return updateBlock(dest, setTextRange(createNodeArray([source, ...dest.statements]), dest.statements));
        }
        else {
            return createBlock(createNodeArray([dest, source]), /*multiLine*/ true);
        }
    }

    export function restoreEnclosingLabel(node: Statement, outermostLabeledStatement: LabeledStatement, afterRestoreLabelCallback?: (node: LabeledStatement) => void): Statement {
        if (!outermostLabeledStatement) {
            return node;
        }
        const updated = updateLabel(
            outermostLabeledStatement,
            outermostLabeledStatement.label,
            outermostLabeledStatement.statement.kind === SyntaxKind.LabeledStatement
                ? restoreEnclosingLabel(node, <LabeledStatement>outermostLabeledStatement.statement)
                : node
        );
        if (afterRestoreLabelCallback) {
            afterRestoreLabelCallback(outermostLabeledStatement);
        }
        return updated;
    }

    export interface CallBinding {
        target: LeftHandSideExpression;
        thisArg: Expression;
    }

    function shouldBeCapturedInTempVariable(node: Expression, cacheIdentifiers: boolean): boolean {
        const target = skipParentheses(node);
        switch (target.kind) {
            case SyntaxKind.Identifier:
                return cacheIdentifiers;
            case SyntaxKind.ThisKeyword:
            case SyntaxKind.NumericLiteral:
            case SyntaxKind.StringLiteral:
                return false;
            case SyntaxKind.ArrayLiteralExpression:
                const elements = (<ArrayLiteralExpression>target).elements;
                if (elements.length === 0) {
                    return false;
                }
                return true;
            case SyntaxKind.ObjectLiteralExpression:
                return (<ObjectLiteralExpression>target).properties.length > 0;
            default:
                return true;
        }
    }

    export function createCallBinding(expression: Expression, recordTempVariable: (temp: Identifier) => void, languageVersion?: ScriptTarget, cacheIdentifiers?: boolean): CallBinding {
        const callee = skipOuterExpressions(expression, OuterExpressionKinds.All);
        let thisArg: Expression;
        let target: LeftHandSideExpression;
        if (isSuperProperty(callee)) {
            thisArg = createThis();
            target = callee;
        }
        else if (callee.kind === SyntaxKind.SuperKeyword) {
            thisArg = createThis();
            target = languageVersion < ScriptTarget.ES2015
                ? setTextRange(createIdentifier("_super"), callee)
                : <PrimaryExpression>callee;
        }
        else if (getEmitFlags(callee) & EmitFlags.HelperName) {
            thisArg = createVoidZero();
            target = parenthesizeForAccess(callee);
        }
        else {
            switch (callee.kind) {
                case SyntaxKind.PropertyAccessExpression: {
                    if (shouldBeCapturedInTempVariable((<PropertyAccessExpression>callee).expression, cacheIdentifiers)) {
                        // for `a.b()` target is `(_a = a).b` and thisArg is `_a`
                        thisArg = createTempVariable(recordTempVariable);
                        target = createPropertyAccess(
                            setTextRange(
                                createAssignment(
                                    thisArg,
                                    (<PropertyAccessExpression>callee).expression
                                ),
                                (<PropertyAccessExpression>callee).expression
                            ),
                            (<PropertyAccessExpression>callee).name
                        );
                        setTextRange(target, callee);
                    }
                    else {
                        thisArg = (<PropertyAccessExpression>callee).expression;
                        target = <PropertyAccessExpression>callee;
                    }
                    break;
                }

                case SyntaxKind.ElementAccessExpression: {
                    if (shouldBeCapturedInTempVariable((<ElementAccessExpression>callee).expression, cacheIdentifiers)) {
                        // for `a[b]()` target is `(_a = a)[b]` and thisArg is `_a`
                        thisArg = createTempVariable(recordTempVariable);
                        target = createElementAccess(
                            setTextRange(
                                createAssignment(
                                    thisArg,
                                    (<ElementAccessExpression>callee).expression
                                ),
                                (<ElementAccessExpression>callee).expression
                            ),
                            (<ElementAccessExpression>callee).argumentExpression
                        );
                        setTextRange(target, callee);
                    }
                    else {
                        thisArg = (<ElementAccessExpression>callee).expression;
                        target = <ElementAccessExpression>callee;
                    }

                    break;
                }

                default: {
                    // for `a()` target is `a` and thisArg is `void 0`
                    thisArg = createVoidZero();
                    target = parenthesizeForAccess(expression);
                    break;
                }
            }
        }

        return { target, thisArg };
    }

    export function inlineExpressions(expressions: Expression[]) {
        // Avoid deeply nested comma expressions as traversing them during emit can result in "Maximum call
        // stack size exceeded" errors.
        return expressions.length > 10
            ? createCommaList(expressions)
            : reduceLeft(expressions, createComma);
    }

    export function createExpressionFromEntityName(node: EntityName | Expression): Expression {
        if (isQualifiedName(node)) {
            const left = createExpressionFromEntityName(node.left);
            const right = getMutableClone(node.right);
            return setTextRange(createPropertyAccess(left, right), node);
        }
        else {
            return getMutableClone(node);
        }
    }

    export function createExpressionForPropertyName(memberName: PropertyName): Expression {
        if (isIdentifier(memberName)) {
            return createLiteral(memberName);
        }
        else if (isComputedPropertyName(memberName)) {
            return getMutableClone(memberName.expression);
        }
        else {
            return getMutableClone(memberName);
        }
    }

    export function createExpressionForObjectLiteralElementLike(node: ObjectLiteralExpression, property: ObjectLiteralElementLike, receiver: Expression): Expression {
        switch (property.kind) {
            case SyntaxKind.GetAccessor:
            case SyntaxKind.SetAccessor:
                return createExpressionForAccessorDeclaration(node.properties, <AccessorDeclaration>property, receiver, node.multiLine);
            case SyntaxKind.PropertyAssignment:
                return createExpressionForPropertyAssignment(<PropertyAssignment>property, receiver);
            case SyntaxKind.ShorthandPropertyAssignment:
                return createExpressionForShorthandPropertyAssignment(<ShorthandPropertyAssignment>property, receiver);
            case SyntaxKind.MethodDeclaration:
                return createExpressionForMethodDeclaration(<MethodDeclaration>property, receiver);
        }
    }

    function createExpressionForAccessorDeclaration(properties: NodeArray<Declaration>, property: AccessorDeclaration, receiver: Expression, multiLine: boolean) {
        const { firstAccessor, getAccessor, setAccessor } = getAllAccessorDeclarations(properties, property);
        if (property === firstAccessor) {
            const properties: ObjectLiteralElementLike[] = [];
            if (getAccessor) {
                const getterFunction = createFunctionExpression(
                    getAccessor.modifiers,
                    /*asteriskToken*/ undefined,
                    /*name*/ undefined,
                    /*typeParameters*/ undefined,
                    getAccessor.parameters,
                    /*type*/ undefined,
                    getAccessor.body
                );
                setTextRange(getterFunction, getAccessor);
                setOriginalNode(getterFunction, getAccessor);
                const getter = createPropertyAssignment("get", getterFunction);
                properties.push(getter);
            }

            if (setAccessor) {
                const setterFunction = createFunctionExpression(
                    setAccessor.modifiers,
                    /*asteriskToken*/ undefined,
                    /*name*/ undefined,
                    /*typeParameters*/ undefined,
                    setAccessor.parameters,
                    /*type*/ undefined,
                    setAccessor.body
                );
                setTextRange(setterFunction, setAccessor);
                setOriginalNode(setterFunction, setAccessor);
                const setter = createPropertyAssignment("set", setterFunction);
                properties.push(setter);
            }

            properties.push(createPropertyAssignment("enumerable", createTrue()));
            properties.push(createPropertyAssignment("configurable", createTrue()));

            const expression = setTextRange(
                createCall(
                    createPropertyAccess(createIdentifier("Object"), "defineProperty"),
                    /*typeArguments*/ undefined,
                    [
                        receiver,
                        createExpressionForPropertyName(property.name),
                        createObjectLiteral(properties, multiLine)
                    ]
                ),
                /*location*/ firstAccessor
            );

            return aggregateTransformFlags(expression);
        }

        return undefined;
    }

    function createExpressionForPropertyAssignment(property: PropertyAssignment, receiver: Expression) {
        return aggregateTransformFlags(
            setOriginalNode(
                setTextRange(
                    createAssignment(
                        createMemberAccessForPropertyName(receiver, property.name, /*location*/ property.name),
                        property.initializer
                    ),
                    property
                ),
                property
            )
        );
    }

    function createExpressionForShorthandPropertyAssignment(property: ShorthandPropertyAssignment, receiver: Expression) {
        return aggregateTransformFlags(
            setOriginalNode(
                setTextRange(
                    createAssignment(
                        createMemberAccessForPropertyName(receiver, property.name, /*location*/ property.name),
                        getSynthesizedClone(property.name)
                    ),
                    /*location*/ property
                ),
                /*original*/ property
            )
        );
    }

    function createExpressionForMethodDeclaration(method: MethodDeclaration, receiver: Expression) {
        return aggregateTransformFlags(
            setOriginalNode(
                setTextRange(
                    createAssignment(
                        createMemberAccessForPropertyName(receiver, method.name, /*location*/ method.name),
                        setOriginalNode(
                            setTextRange(
                                createFunctionExpression(
                                    method.modifiers,
                                    method.asteriskToken,
                                    /*name*/ undefined,
                                    /*typeParameters*/ undefined,
                                    method.parameters,
                                    /*type*/ undefined,
                                    method.body
                                ),
                                /*location*/ method
                            ),
                            /*original*/ method
                        )
                    ),
                    /*location*/ method
                ),
                /*original*/ method
            )
        );
    }

    /**
     * Gets the internal name of a declaration. This is primarily used for declarations that can be
     * referred to by name in the body of an ES5 class function body. An internal name will *never*
     * be prefixed with an module or namespace export modifier like "exports." when emitted as an
     * expression. An internal name will also *never* be renamed due to a collision with a block
     * scoped variable.
     *
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    export function getInternalName(node: Declaration, allowComments?: boolean, allowSourceMaps?: boolean) {
        return getName(node, allowComments, allowSourceMaps, EmitFlags.LocalName | EmitFlags.InternalName);
    }

    /**
     * Gets whether an identifier should only be referred to by its internal name.
     */
    export function isInternalName(node: Identifier) {
        return (getEmitFlags(node) & EmitFlags.InternalName) !== 0;
    }

    /**
     * Gets the local name of a declaration. This is primarily used for declarations that can be
     * referred to by name in the declaration's immediate scope (classes, enums, namespaces). A
     * local name will *never* be prefixed with an module or namespace export modifier like
     * "exports." when emitted as an expression.
     *
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    export function getLocalName(node: Declaration, allowComments?: boolean, allowSourceMaps?: boolean) {
        return getName(node, allowComments, allowSourceMaps, EmitFlags.LocalName);
    }

    /**
     * Gets whether an identifier should only be referred to by its local name.
     */
    export function isLocalName(node: Identifier) {
        return (getEmitFlags(node) & EmitFlags.LocalName) !== 0;
    }

    /**
     * Gets the export name of a declaration. This is primarily used for declarations that can be
     * referred to by name in the declaration's immediate scope (classes, enums, namespaces). An
     * export name will *always* be prefixed with an module or namespace export modifier like
     * `"exports."` when emitted as an expression if the name points to an exported symbol.
     *
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    export function getExportName(node: Declaration, allowComments?: boolean, allowSourceMaps?: boolean): Identifier {
        return getName(node, allowComments, allowSourceMaps, EmitFlags.ExportName);
    }

    /**
     * Gets whether an identifier should only be referred to by its export representation if the
     * name points to an exported symbol.
     */
    export function isExportName(node: Identifier) {
        return (getEmitFlags(node) & EmitFlags.ExportName) !== 0;
    }

    /**
     * Gets the name of a declaration for use in declarations.
     *
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    export function getDeclarationName(node: Declaration, allowComments?: boolean, allowSourceMaps?: boolean) {
        return getName(node, allowComments, allowSourceMaps);
    }

    function getName(node: Declaration, allowComments?: boolean, allowSourceMaps?: boolean, emitFlags?: EmitFlags) {
        const nodeName = getNameOfDeclaration(node);
        if (nodeName && isIdentifier(nodeName) && !isGeneratedIdentifier(nodeName)) {
            const name = getMutableClone(nodeName);
            emitFlags |= getEmitFlags(nodeName);
            if (!allowSourceMaps) emitFlags |= EmitFlags.NoSourceMap;
            if (!allowComments) emitFlags |= EmitFlags.NoComments;
            if (emitFlags) setEmitFlags(name, emitFlags);
            return name;
        }
        return getGeneratedNameForNode(node);
    }

    /**
     * Gets the exported name of a declaration for use in expressions.
     *
     * An exported name will *always* be prefixed with an module or namespace export modifier like
     * "exports." if the name points to an exported symbol.
     *
     * @param ns The namespace identifier.
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    export function getExternalModuleOrNamespaceExportName(ns: Identifier | undefined, node: Declaration, allowComments?: boolean, allowSourceMaps?: boolean): Identifier | PropertyAccessExpression {
        if (ns && hasModifier(node, ModifierFlags.Export)) {
            return getNamespaceMemberName(ns, getName(node), allowComments, allowSourceMaps);
        }
        return getExportName(node, allowComments, allowSourceMaps);
    }

    /**
     * Gets a namespace-qualified name for use in expressions.
     *
     * @param ns The namespace identifier.
     * @param name The name.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    export function getNamespaceMemberName(ns: Identifier, name: Identifier, allowComments?: boolean, allowSourceMaps?: boolean): PropertyAccessExpression {
        const qualifiedName = createPropertyAccess(ns, nodeIsSynthesized(name) ? name : getSynthesizedClone(name));
        setTextRange(qualifiedName, name);
        let emitFlags: EmitFlags;
        if (!allowSourceMaps) emitFlags |= EmitFlags.NoSourceMap;
        if (!allowComments) emitFlags |= EmitFlags.NoComments;
        if (emitFlags) setEmitFlags(qualifiedName, emitFlags);
        return qualifiedName;
    }

    export function convertToFunctionBody(node: ConciseBody, multiLine?: boolean) {
        return isBlock(node) ? node : setTextRange(createBlock([setTextRange(createReturn(node), node)], multiLine), node);
    }

    function isUseStrictPrologue(node: ExpressionStatement): boolean {
        return (node.expression as StringLiteral).text === "use strict";
    }

    /**
     * Add any necessary prologue-directives into target statement-array.
     * The function needs to be called during each transformation step.
     * This function needs to be called whenever we transform the statement
     * list of a source file, namespace, or function-like body.
     *
     * @param target: result statements array
     * @param source: origin statements array
     * @param ensureUseStrict: boolean determining whether the function need to add prologue-directives
     * @param visitor: Optional callback used to visit any custom prologue directives.
     */
    export function addPrologue(target: Statement[], source: Statement[], ensureUseStrict?: boolean, visitor?: (node: Node) => VisitResult<Node>): number {
        const offset = addStandardPrologue(target, source, ensureUseStrict);
        return addCustomPrologue(target, source, offset, visitor);
    }

    /**
     * Add just the standard (string-expression) prologue-directives into target statement-array.
     * The function needs to be called during each transformation step.
     * This function needs to be called whenever we transform the statement
     * list of a source file, namespace, or function-like body.
     */
    export function addStandardPrologue(target: Statement[], source: Statement[], ensureUseStrict?: boolean): number {
        Debug.assert(target.length === 0, "Prologue directives should be at the first statement in the target statements array");
        let foundUseStrict = false;
        let statementOffset = 0;
        const numStatements = source.length;
        while (statementOffset < numStatements) {
            const statement = source[statementOffset];
            if (isPrologueDirective(statement)) {
                if (isUseStrictPrologue(statement)) {
                    foundUseStrict = true;
                }
                target.push(statement);
            }
            else {
                break;
            }
            statementOffset++;
        }
        if (ensureUseStrict && !foundUseStrict) {
            target.push(startOnNewLine(createStatement(createLiteral("use strict"))));
        }
        return statementOffset;
    }

    /**
     * Add just the custom prologue-directives into target statement-array.
     * The function needs to be called during each transformation step.
     * This function needs to be called whenever we transform the statement
     * list of a source file, namespace, or function-like body.
     */
    export function addCustomPrologue(target: Statement[], source: Statement[], statementOffset: number, visitor?: (node: Node) => VisitResult<Node>): number {
        const numStatements = source.length;
        while (statementOffset < numStatements) {
            const statement = source[statementOffset];
            if (getEmitFlags(statement) & EmitFlags.CustomPrologue) {
                target.push(visitor ? visitNode(statement, visitor, isStatement) : statement);
            }
            else {
                break;
            }
            statementOffset++;
        }
        return statementOffset;
    }

    export function startsWithUseStrict(statements: Statement[]) {
        const firstStatement = firstOrUndefined(statements);
        return firstStatement !== undefined
            && isPrologueDirective(firstStatement)
            && isUseStrictPrologue(firstStatement);
    }

    /**
     * Ensures "use strict" directive is added
     *
     * @param statements An array of statements
     */
    export function ensureUseStrict(statements: NodeArray<Statement>): NodeArray<Statement> {
        let foundUseStrict = false;
        for (const statement of statements) {
            if (isPrologueDirective(statement)) {
                if (isUseStrictPrologue(statement as ExpressionStatement)) {
                    foundUseStrict = true;
                    break;
                }
            }
            else {
                break;
            }
        }

        if (!foundUseStrict) {
            return setTextRange(
                createNodeArray<Statement>([
                    startOnNewLine(createStatement(createLiteral("use strict"))),
                    ...statements
                ]),
                statements
            );
        }

        return statements;
    }

    export function parenthesizeConditionalHead(condition: Expression) {
        const conditionalPrecedence = getOperatorPrecedence(SyntaxKind.ConditionalExpression, SyntaxKind.QuestionToken);
        const emittedCondition = skipPartiallyEmittedExpressions(condition);
        const conditionPrecedence = getExpressionPrecedence(emittedCondition);
        if (compareValues(conditionPrecedence, conditionalPrecedence) === Comparison.LessThan) {
            return createParen(condition);
        }
        return condition;
    }

    /**
     * Wraps the operand to a BinaryExpression in parentheses if they are needed to preserve the intended
     * order of operations.
     *
     * @param binaryOperator The operator for the BinaryExpression.
     * @param operand The operand for the BinaryExpression.
     * @param isLeftSideOfBinary A value indicating whether the operand is the left side of the
     *                           BinaryExpression.
     */
    export function parenthesizeBinaryOperand(binaryOperator: SyntaxKind, operand: Expression, isLeftSideOfBinary: boolean, leftOperand?: Expression) {
        const skipped = skipPartiallyEmittedExpressions(operand);

        // If the resulting expression is already parenthesized, we do not need to do any further processing.
        if (skipped.kind === SyntaxKind.ParenthesizedExpression) {
            return operand;
        }

        return binaryOperandNeedsParentheses(binaryOperator, operand, isLeftSideOfBinary, leftOperand)
            ? createParen(operand)
            : operand;
    }

    /**
     * Determines whether the operand to a BinaryExpression needs to be parenthesized.
     *
     * @param binaryOperator The operator for the BinaryExpression.
     * @param operand The operand for the BinaryExpression.
     * @param isLeftSideOfBinary A value indicating whether the operand is the left side of the
     *                           BinaryExpression.
     */
    function binaryOperandNeedsParentheses(binaryOperator: SyntaxKind, operand: Expression, isLeftSideOfBinary: boolean, leftOperand: Expression) {
        // If the operand has lower precedence, then it needs to be parenthesized to preserve the
        // intent of the expression. For example, if the operand is `a + b` and the operator is
        // `*`, then we need to parenthesize the operand to preserve the intended order of
        // operations: `(a + b) * x`.
        //
        // If the operand has higher precedence, then it does not need to be parenthesized. For
        // example, if the operand is `a * b` and the operator is `+`, then we do not need to
        // parenthesize to preserve the intended order of operations: `a * b + x`.
        //
        // If the operand has the same precedence, then we need to check the associativity of
        // the operator based on whether this is the left or right operand of the expression.
        //
        // For example, if `a / d` is on the right of operator `*`, we need to parenthesize
        // to preserve the intended order of operations: `x * (a / d)`
        //
        // If `a ** d` is on the left of operator `**`, we need to parenthesize to preserve
        // the intended order of operations: `(a ** b) ** c`
        const binaryOperatorPrecedence = getOperatorPrecedence(SyntaxKind.BinaryExpression, binaryOperator);
        const binaryOperatorAssociativity = getOperatorAssociativity(SyntaxKind.BinaryExpression, binaryOperator);
        const emittedOperand = skipPartiallyEmittedExpressions(operand);
        const operandPrecedence = getExpressionPrecedence(emittedOperand);
        switch (compareValues(operandPrecedence, binaryOperatorPrecedence)) {
            case Comparison.LessThan:
                // If the operand is the right side of a right-associative binary operation
                // and is a yield expression, then we do not need parentheses.
                if (!isLeftSideOfBinary
                    && binaryOperatorAssociativity === Associativity.Right
                    && operand.kind === SyntaxKind.YieldExpression) {
                    return false;
                }

                return true;

            case Comparison.GreaterThan:
                return false;

            case Comparison.EqualTo:
                if (isLeftSideOfBinary) {
                    // No need to parenthesize the left operand when the binary operator is
                    // left associative:
                    //  (a*b)/x    ->  a*b/x
                    //  (a**b)/x   ->  a**b/x
                    //
                    // Parentheses are needed for the left operand when the binary operator is
                    // right associative:
                    //  (a/b)**x   ->  (a/b)**x
                    //  (a**b)**x  ->  (a**b)**x
                    return binaryOperatorAssociativity === Associativity.Right;
                }
                else {
                    if (isBinaryExpression(emittedOperand)
                        && emittedOperand.operatorToken.kind === binaryOperator) {
                        // No need to parenthesize the right operand when the binary operator and
                        // operand are the same and one of the following:
                        //  x*(a*b)     => x*a*b
                        //  x|(a|b)     => x|a|b
                        //  x&(a&b)     => x&a&b
                        //  x^(a^b)     => x^a^b
                        if (operatorHasAssociativeProperty(binaryOperator)) {
                            return false;
                        }

                        // No need to parenthesize the right operand when the binary operator
                        // is plus (+) if both the left and right operands consist solely of either
                        // literals of the same kind or binary plus (+) expressions for literals of
                        // the same kind (recursively).
                        //  "a"+(1+2)       => "a"+(1+2)
                        //  "a"+("b"+"c")   => "a"+"b"+"c"
                        if (binaryOperator === SyntaxKind.PlusToken) {
                            const leftKind = leftOperand ? getLiteralKindOfBinaryPlusOperand(leftOperand) : SyntaxKind.Unknown;
                            if (isLiteralKind(leftKind) && leftKind === getLiteralKindOfBinaryPlusOperand(emittedOperand)) {
                                return false;
                            }
                        }
                    }

                    // No need to parenthesize the right operand when the operand is right
                    // associative:
                    //  x/(a**b)    -> x/a**b
                    //  x**(a**b)   -> x**a**b
                    //
                    // Parentheses are needed for the right operand when the operand is left
                    // associative:
                    //  x/(a*b)     -> x/(a*b)
                    //  x**(a/b)    -> x**(a/b)
                    const operandAssociativity = getExpressionAssociativity(emittedOperand);
                    return operandAssociativity === Associativity.Left;
                }
        }
    }

    /**
     * Determines whether a binary operator is mathematically associative.
     *
     * @param binaryOperator The binary operator.
     */
    function operatorHasAssociativeProperty(binaryOperator: SyntaxKind) {
        // The following operators are associative in JavaScript:
        //  (a*b)*c     -> a*(b*c)  -> a*b*c
        //  (a|b)|c     -> a|(b|c)  -> a|b|c
        //  (a&b)&c     -> a&(b&c)  -> a&b&c
        //  (a^b)^c     -> a^(b^c)  -> a^b^c
        //
        // While addition is associative in mathematics, JavaScript's `+` is not
        // guaranteed to be associative as it is overloaded with string concatenation.
        return binaryOperator === SyntaxKind.AsteriskToken
            || binaryOperator === SyntaxKind.BarToken
            || binaryOperator === SyntaxKind.AmpersandToken
            || binaryOperator === SyntaxKind.CaretToken;
    }

    interface BinaryPlusExpression extends BinaryExpression {
        cachedLiteralKind: SyntaxKind;
    }

    /**
     * This function determines whether an expression consists of a homogeneous set of
     * literal expressions or binary plus expressions that all share the same literal kind.
     * It is used to determine whether the right-hand operand of a binary plus expression can be
     * emitted without parentheses.
     */
    function getLiteralKindOfBinaryPlusOperand(node: Expression): SyntaxKind {
        node = skipPartiallyEmittedExpressions(node);

        if (isLiteralKind(node.kind)) {
            return node.kind;
        }

        if (node.kind === SyntaxKind.BinaryExpression && (<BinaryExpression>node).operatorToken.kind === SyntaxKind.PlusToken) {
            if ((<BinaryPlusExpression>node).cachedLiteralKind !== undefined) {
                return (<BinaryPlusExpression>node).cachedLiteralKind;
            }

            const leftKind = getLiteralKindOfBinaryPlusOperand((<BinaryExpression>node).left);
            const literalKind = isLiteralKind(leftKind)
                && leftKind === getLiteralKindOfBinaryPlusOperand((<BinaryExpression>node).right)
                    ? leftKind
                    : SyntaxKind.Unknown;

            (<BinaryPlusExpression>node).cachedLiteralKind = literalKind;
            return literalKind;
        }

        return SyntaxKind.Unknown;
    }

    export function parenthesizeForConditionalHead(condition: Expression) {
        const conditionalPrecedence = getOperatorPrecedence(SyntaxKind.ConditionalExpression, SyntaxKind.QuestionToken);
        const emittedCondition = skipPartiallyEmittedExpressions(condition);
        const conditionPrecedence = getExpressionPrecedence(emittedCondition);
        if (compareValues(conditionPrecedence, conditionalPrecedence) === Comparison.LessThan) {
            return createParen(condition);
        }
        return condition;
    }

    export function parenthesizeSubexpressionOfConditionalExpression(e: Expression): Expression {
        // per ES grammar both 'whenTrue' and 'whenFalse' parts of conditional expression are assignment expressions
        // so in case when comma expression is introduced as a part of previous transformations
        // if should be wrapped in parens since comma operator has the lowest precedence
        return e.kind === SyntaxKind.BinaryExpression && (<BinaryExpression>e).operatorToken.kind === SyntaxKind.CommaToken
            ? createParen(e)
            : e;
    }

    /**
     * Wraps an expression in parentheses if it is needed in order to use the expression
     * as the expression of a NewExpression node.
     *
     * @param expression The Expression node.
     */
    export function parenthesizeForNew(expression: Expression): LeftHandSideExpression {
        const emittedExpression = skipPartiallyEmittedExpressions(expression);
        switch (emittedExpression.kind) {
            case SyntaxKind.CallExpression:
                return createParen(expression);

            case SyntaxKind.NewExpression:
                return (<NewExpression>emittedExpression).arguments
                    ? <LeftHandSideExpression>expression
                    : createParen(expression);
        }

        return parenthesizeForAccess(expression);
    }

    /**
     * Wraps an expression in parentheses if it is needed in order to use the expression for
     * property or element access.
     *
     * @param expr The expression node.
     */
    export function parenthesizeForAccess(expression: Expression): LeftHandSideExpression {
        // isLeftHandSideExpression is almost the correct criterion for when it is not necessary
        // to parenthesize the expression before a dot. The known exception is:
        //
        //    NewExpression:
        //       new C.x        -> not the same as (new C).x
        //
        const emittedExpression = skipPartiallyEmittedExpressions(expression);
        if (isLeftHandSideExpression(emittedExpression)
            && (emittedExpression.kind !== SyntaxKind.NewExpression || (<NewExpression>emittedExpression).arguments)) {
            return <LeftHandSideExpression>expression;
        }

        return setTextRange(createParen(expression), expression);
    }

    export function parenthesizePostfixOperand(operand: Expression) {
        return isLeftHandSideExpression(operand)
            ? <LeftHandSideExpression>operand
            : setTextRange(createParen(operand), operand);
    }

    export function parenthesizePrefixOperand(operand: Expression) {
        return isUnaryExpression(operand)
            ? <UnaryExpression>operand
            : setTextRange(createParen(operand), operand);
    }

    export function parenthesizeListElements(elements: NodeArray<Expression>) {
        let result: Expression[];
        for (let i = 0; i < elements.length; i++) {
            const element = parenthesizeExpressionForList(elements[i]);
            if (result !== undefined || element !== elements[i]) {
                if (result === undefined) {
                    result = elements.slice(0, i);
                }

                result.push(element);
            }
        }

        if (result !== undefined) {
            return setTextRange(createNodeArray(result, elements.hasTrailingComma), elements);
        }

        return elements;
    }

    export function parenthesizeExpressionForList(expression: Expression) {
        const emittedExpression = skipPartiallyEmittedExpressions(expression);
        const expressionPrecedence = getExpressionPrecedence(emittedExpression);
        const commaPrecedence = getOperatorPrecedence(SyntaxKind.BinaryExpression, SyntaxKind.CommaToken);
        return expressionPrecedence > commaPrecedence
            ? expression
            : setTextRange(createParen(expression), expression);
    }

    export function parenthesizeExpressionForExpressionStatement(expression: Expression) {
        const emittedExpression = skipPartiallyEmittedExpressions(expression);
        if (isCallExpression(emittedExpression)) {
            const callee = emittedExpression.expression;
            const kind = skipPartiallyEmittedExpressions(callee).kind;
            if (kind === SyntaxKind.FunctionExpression || kind === SyntaxKind.ArrowFunction) {
                const mutableCall = getMutableClone(emittedExpression);
                mutableCall.expression = setTextRange(createParen(callee), callee);
                return recreatePartiallyEmittedExpressions(expression, mutableCall);
            }
        }
        else {
            const leftmostExpressionKind = getLeftmostExpression(emittedExpression).kind;
            if (leftmostExpressionKind === SyntaxKind.ObjectLiteralExpression || leftmostExpressionKind === SyntaxKind.FunctionExpression) {
                return setTextRange(createParen(expression), expression);
            }
        }

        return expression;
    }

    /**
     * Clones a series of not-emitted expressions with a new inner expression.
     *
     * @param originalOuterExpression The original outer expression.
     * @param newInnerExpression The new inner expression.
     */
    function recreatePartiallyEmittedExpressions(originalOuterExpression: Expression, newInnerExpression: Expression) {
        if (isPartiallyEmittedExpression(originalOuterExpression)) {
            const clone = getMutableClone(originalOuterExpression);
            clone.expression = recreatePartiallyEmittedExpressions(clone.expression, newInnerExpression);
            return clone;
        }

        return newInnerExpression;
    }

    function getLeftmostExpression(node: Expression): Expression {
        while (true) {
            switch (node.kind) {
                case SyntaxKind.PostfixUnaryExpression:
                    node = (<PostfixUnaryExpression>node).operand;
                    continue;

                case SyntaxKind.BinaryExpression:
                    node = (<BinaryExpression>node).left;
                    continue;

                case SyntaxKind.ConditionalExpression:
                    node = (<ConditionalExpression>node).condition;
                    continue;

                case SyntaxKind.CallExpression:
                case SyntaxKind.ElementAccessExpression:
                case SyntaxKind.PropertyAccessExpression:
                    node = (<CallExpression | PropertyAccessExpression | ElementAccessExpression>node).expression;
                    continue;

                case SyntaxKind.PartiallyEmittedExpression:
                    node = (<PartiallyEmittedExpression>node).expression;
                    continue;
            }

            return node;
        }
    }

    export function parenthesizeConciseBody(body: ConciseBody): ConciseBody {
        if (!isBlock(body) && getLeftmostExpression(body).kind === SyntaxKind.ObjectLiteralExpression) {
            return setTextRange(createParen(<Expression>body), body);
        }

        return body;
    }

    export const enum OuterExpressionKinds {
        Parentheses = 1 << 0,
        Assertions = 1 << 1,
        PartiallyEmittedExpressions = 1 << 2,

        All = Parentheses | Assertions | PartiallyEmittedExpressions
    }

    export function skipOuterExpressions(node: Expression, kinds?: OuterExpressionKinds): Expression;
    export function skipOuterExpressions(node: Node, kinds?: OuterExpressionKinds): Node;
    export function skipOuterExpressions(node: Node, kinds = OuterExpressionKinds.All) {
        let previousNode: Node;
        do {
            previousNode = node;
            if (kinds & OuterExpressionKinds.Parentheses) {
                node = skipParentheses(node);
            }

            if (kinds & OuterExpressionKinds.Assertions) {
                node = skipAssertions(node);
            }

            if (kinds & OuterExpressionKinds.PartiallyEmittedExpressions) {
                node = skipPartiallyEmittedExpressions(node);
            }
        }
        while (previousNode !== node);

        return node;
    }

    export function skipParentheses(node: Expression): Expression;
    export function skipParentheses(node: Node): Node;
    export function skipParentheses(node: Node): Node {
        while (node.kind === SyntaxKind.ParenthesizedExpression) {
            node = (<ParenthesizedExpression>node).expression;
        }

        return node;
    }

    export function skipAssertions(node: Expression): Expression;
    export function skipAssertions(node: Node): Node;
    export function skipAssertions(node: Node): Node {
        while (isAssertionExpression(node)) {
            node = (<AssertionExpression>node).expression;
        }

        return node;
    }

    export function skipPartiallyEmittedExpressions(node: Expression): Expression;
    export function skipPartiallyEmittedExpressions(node: Node): Node;
    export function skipPartiallyEmittedExpressions(node: Node) {
        while (node.kind === SyntaxKind.PartiallyEmittedExpression) {
            node = (<PartiallyEmittedExpression>node).expression;
        }

        return node;
    }

    export function startOnNewLine<T extends Node>(node: T): T {
        node.startsOnNewLine = true;
        return node;
    }

    export function getExternalHelpersModuleName(node: SourceFile) {
        const parseNode = getOriginalNode(node, isSourceFile);
        const emitNode = parseNode && parseNode.emitNode;
        return emitNode && emitNode.externalHelpersModuleName;
    }

    export function getOrCreateExternalHelpersModuleNameIfNeeded(node: SourceFile, compilerOptions: CompilerOptions) {
        if (compilerOptions.importHelpers && (isExternalModule(node) || compilerOptions.isolatedModules)) {
            const externalHelpersModuleName = getExternalHelpersModuleName(node);
            if (externalHelpersModuleName) {
                return externalHelpersModuleName;
            }

            const helpers = getEmitHelpers(node);
            if (helpers) {
                for (const helper of helpers) {
                    if (!helper.scoped) {
                        const parseNode = getOriginalNode(node, isSourceFile);
                        const emitNode = getOrCreateEmitNode(parseNode);
                        return emitNode.externalHelpersModuleName || (emitNode.externalHelpersModuleName = createUniqueName(externalHelpersModuleNameText));
                    }
                }
            }
        }
    }

    /**
     * Get the name of that target module from an import or export declaration
     */
    export function getLocalNameForExternalImport(node: ImportDeclaration | ExportDeclaration | ImportEqualsDeclaration, sourceFile: SourceFile): Identifier {
        const namespaceDeclaration = getNamespaceDeclarationNode(node);
        if (namespaceDeclaration && !isDefaultImport(node)) {
            const name = namespaceDeclaration.name;
            return isGeneratedIdentifier(name) ? name : createIdentifier(getSourceTextOfNodeFromSourceFile(sourceFile, namespaceDeclaration.name));
        }
        if (node.kind === SyntaxKind.ImportDeclaration && (<ImportDeclaration>node).importClause) {
            return getGeneratedNameForNode(node);
        }
        if (node.kind === SyntaxKind.ExportDeclaration && (<ExportDeclaration>node).moduleSpecifier) {
            return getGeneratedNameForNode(node);
        }
        return undefined;
    }

    /**
     * Get the name of a target module from an import/export declaration as should be written in the emitted output.
     * The emitted output name can be different from the input if:
     *  1. The module has a /// <amd-module name="<new name>" />
     *  2. --out or --outFile is used, making the name relative to the rootDir
     *  3- The containing SourceFile has an entry in renamedDependencies for the import as requested by some module loaders (e.g. System).
     * Otherwise, a new StringLiteral node representing the module name will be returned.
     */
    export function getExternalModuleNameLiteral(importNode: ImportDeclaration | ExportDeclaration | ImportEqualsDeclaration, sourceFile: SourceFile, host: EmitHost, resolver: EmitResolver, compilerOptions: CompilerOptions) {
        const moduleName = getExternalModuleName(importNode);
        if (moduleName.kind === SyntaxKind.StringLiteral) {
            return tryGetModuleNameFromDeclaration(importNode, host, resolver, compilerOptions)
                || tryRenameExternalModule(<StringLiteral>moduleName, sourceFile)
                || getSynthesizedClone(<StringLiteral>moduleName);
        }

        return undefined;
    }

    /**
     * Some bundlers (SystemJS builder) sometimes want to rename dependencies.
     * Here we check if alternative name was provided for a given moduleName and return it if possible.
     */
    function tryRenameExternalModule(moduleName: LiteralExpression, sourceFile: SourceFile) {
        const rename = sourceFile.renamedDependencies && sourceFile.renamedDependencies.get(moduleName.text);
        return rename && createLiteral(rename);
    }

    /**
     * Get the name of a module as should be written in the emitted output.
     * The emitted output name can be different from the input if:
     *  1. The module has a /// <amd-module name="<new name>" />
     *  2. --out or --outFile is used, making the name relative to the rootDir
     * Otherwise, a new StringLiteral node representing the module name will be returned.
     */
    export function tryGetModuleNameFromFile(file: SourceFile, host: EmitHost, options: CompilerOptions): StringLiteral {
        if (!file) {
            return undefined;
        }
        if (file.moduleName) {
            return createLiteral(file.moduleName);
        }
        if (!isDeclarationFile(file) && (options.out || options.outFile)) {
            return createLiteral(getExternalModuleNameFromPath(host, file.fileName));
        }
        return undefined;
    }

    function tryGetModuleNameFromDeclaration(declaration: ImportEqualsDeclaration | ImportDeclaration | ExportDeclaration, host: EmitHost, resolver: EmitResolver, compilerOptions: CompilerOptions) {
        return tryGetModuleNameFromFile(resolver.getExternalModuleFileFromDeclaration(declaration), host, compilerOptions);
    }

    /**
     * Gets the initializer of an BindingOrAssignmentElement.
     */
    export function getInitializerOfBindingOrAssignmentElement(bindingElement: BindingOrAssignmentElement): Expression | undefined {
        if (isDeclarationBindingElement(bindingElement)) {
            // `1` in `let { a = 1 } = ...`
            // `1` in `let { a: b = 1 } = ...`
            // `1` in `let { a: {b} = 1 } = ...`
            // `1` in `let { a: [b] = 1 } = ...`
            // `1` in `let [a = 1] = ...`
            // `1` in `let [{a} = 1] = ...`
            // `1` in `let [[a] = 1] = ...`
            return bindingElement.initializer;
        }

        if (isPropertyAssignment(bindingElement)) {
            // `1` in `({ a: b = 1 } = ...)`
            // `1` in `({ a: {b} = 1 } = ...)`
            // `1` in `({ a: [b] = 1 } = ...)`
            return isAssignmentExpression(bindingElement.initializer, /*excludeCompoundAssignment*/ true)
                ? bindingElement.initializer.right
                : undefined;
        }

        if (isShorthandPropertyAssignment(bindingElement)) {
            // `1` in `({ a = 1 } = ...)`
            return bindingElement.objectAssignmentInitializer;
        }

        if (isAssignmentExpression(bindingElement, /*excludeCompoundAssignment*/ true)) {
            // `1` in `[a = 1] = ...`
            // `1` in `[{a} = 1] = ...`
            // `1` in `[[a] = 1] = ...`
            return bindingElement.right;
        }

        if (isSpreadExpression(bindingElement)) {
            // Recovery consistent with existing emit.
            return getInitializerOfBindingOrAssignmentElement(<BindingOrAssignmentElement>bindingElement.expression);
        }
    }

    /**
     * Gets the name of an BindingOrAssignmentElement.
     */
    export function getTargetOfBindingOrAssignmentElement(bindingElement: BindingOrAssignmentElement): BindingOrAssignmentElementTarget {
        if (isDeclarationBindingElement(bindingElement)) {
            // `a` in `let { a } = ...`
            // `a` in `let { a = 1 } = ...`
            // `b` in `let { a: b } = ...`
            // `b` in `let { a: b = 1 } = ...`
            // `a` in `let { ...a } = ...`
            // `{b}` in `let { a: {b} } = ...`
            // `{b}` in `let { a: {b} = 1 } = ...`
            // `[b]` in `let { a: [b] } = ...`
            // `[b]` in `let { a: [b] = 1 } = ...`
            // `a` in `let [a] = ...`
            // `a` in `let [a = 1] = ...`
            // `a` in `let [...a] = ...`
            // `{a}` in `let [{a}] = ...`
            // `{a}` in `let [{a} = 1] = ...`
            // `[a]` in `let [[a]] = ...`
            // `[a]` in `let [[a] = 1] = ...`
            return <ObjectBindingPattern | ArrayBindingPattern | Identifier>bindingElement.name;
        }

        if (isObjectLiteralElementLike(bindingElement)) {
            switch (bindingElement.kind) {
                case SyntaxKind.PropertyAssignment:
                    // `b` in `({ a: b } = ...)`
                    // `b` in `({ a: b = 1 } = ...)`
                    // `{b}` in `({ a: {b} } = ...)`
                    // `{b}` in `({ a: {b} = 1 } = ...)`
                    // `[b]` in `({ a: [b] } = ...)`
                    // `[b]` in `({ a: [b] = 1 } = ...)`
                    // `b.c` in `({ a: b.c } = ...)`
                    // `b.c` in `({ a: b.c = 1 } = ...)`
                    // `b[0]` in `({ a: b[0] } = ...)`
                    // `b[0]` in `({ a: b[0] = 1 } = ...)`
                    return getTargetOfBindingOrAssignmentElement(<BindingOrAssignmentElement>bindingElement.initializer);

                case SyntaxKind.ShorthandPropertyAssignment:
                    // `a` in `({ a } = ...)`
                    // `a` in `({ a = 1 } = ...)`
                    return bindingElement.name;

                case SyntaxKind.SpreadAssignment:
                    // `a` in `({ ...a } = ...)`
                    return getTargetOfBindingOrAssignmentElement(<BindingOrAssignmentElement>bindingElement.expression);
            }

            // no target
            return undefined;
        }

        if (isAssignmentExpression(bindingElement, /*excludeCompoundAssignment*/ true)) {
            // `a` in `[a = 1] = ...`
            // `{a}` in `[{a} = 1] = ...`
            // `[a]` in `[[a] = 1] = ...`
            // `a.b` in `[a.b = 1] = ...`
            // `a[0]` in `[a[0] = 1] = ...`
            return getTargetOfBindingOrAssignmentElement(<BindingOrAssignmentElement>bindingElement.left);
        }

        if (isSpreadExpression(bindingElement)) {
            // `a` in `[...a] = ...`
            return getTargetOfBindingOrAssignmentElement(<BindingOrAssignmentElement>bindingElement.expression);
        }

        // `a` in `[a] = ...`
        // `{a}` in `[{a}] = ...`
        // `[a]` in `[[a]] = ...`
        // `a.b` in `[a.b] = ...`
        // `a[0]` in `[a[0]] = ...`
        return bindingElement;
    }

    /**
     * Determines whether an BindingOrAssignmentElement is a rest element.
     */
    export function getRestIndicatorOfBindingOrAssignmentElement(bindingElement: BindingOrAssignmentElement): BindingOrAssignmentElementRestIndicator {
        switch (bindingElement.kind) {
            case SyntaxKind.Parameter:
            case SyntaxKind.BindingElement:
                // `...` in `let [...a] = ...`
                return (<ParameterDeclaration | BindingElement>bindingElement).dotDotDotToken;

            case SyntaxKind.SpreadElement:
            case SyntaxKind.SpreadAssignment:
                // `...` in `[...a] = ...`
                return <SpreadElement | SpreadAssignment>bindingElement;
        }

        return undefined;
    }

    /**
     * Gets the property name of a BindingOrAssignmentElement
     */
    export function getPropertyNameOfBindingOrAssignmentElement(bindingElement: BindingOrAssignmentElement) {
        switch (bindingElement.kind) {
            case SyntaxKind.BindingElement:
                // `a` in `let { a: b } = ...`
                // `[a]` in `let { [a]: b } = ...`
                // `"a"` in `let { "a": b } = ...`
                // `1` in `let { 1: b } = ...`
                if ((<BindingElement>bindingElement).propertyName) {
                    const propertyName = (<BindingElement>bindingElement).propertyName;
                    return isComputedPropertyName(propertyName) && isStringOrNumericLiteral(propertyName.expression)
                        ? propertyName.expression
                        : propertyName;
                }

                break;

            case SyntaxKind.PropertyAssignment:
                // `a` in `({ a: b } = ...)`
                // `[a]` in `({ [a]: b } = ...)`
                // `"a"` in `({ "a": b } = ...)`
                // `1` in `({ 1: b } = ...)`
                if ((<PropertyAssignment>bindingElement).name) {
                    const propertyName = (<PropertyAssignment>bindingElement).name;
                    return isComputedPropertyName(propertyName) && isStringOrNumericLiteral(propertyName.expression)
                        ? propertyName.expression
                        : propertyName;
                }

                break;

            case SyntaxKind.SpreadAssignment:
                // `a` in `({ ...a } = ...)`
                return (<SpreadAssignment>bindingElement).name;
        }

        const target = getTargetOfBindingOrAssignmentElement(bindingElement);
        if (target && isPropertyName(target)) {
            return isComputedPropertyName(target) && isStringOrNumericLiteral(target.expression)
                ? target.expression
                : target;
        }

        Debug.fail("Invalid property name for binding element.");
    }

    /**
     * Gets the elements of a BindingOrAssignmentPattern
     */
    export function getElementsOfBindingOrAssignmentPattern(name: BindingOrAssignmentPattern): BindingOrAssignmentElement[] {
        switch (name.kind) {
            case SyntaxKind.ObjectBindingPattern:
            case SyntaxKind.ArrayBindingPattern:
            case SyntaxKind.ArrayLiteralExpression:
                // `a` in `{a}`
                // `a` in `[a]`
                return <BindingOrAssignmentElement[]>name.elements;

            case SyntaxKind.ObjectLiteralExpression:
                // `a` in `{a}`
                return <BindingOrAssignmentElement[]>name.properties;
        }
    }

    export function convertToArrayAssignmentElement(element: BindingOrAssignmentElement) {
        if (isBindingElement(element)) {
            if (element.dotDotDotToken) {
                Debug.assertNode(element.name, isIdentifier);
                return setOriginalNode(setTextRange(createSpread(<Identifier>element.name), element), element);
            }
            const expression = convertToAssignmentElementTarget(<ObjectBindingPattern | ArrayBindingPattern | Identifier>element.name);
            return element.initializer
                ? setOriginalNode(
                    setTextRange(
                        createAssignment(expression, element.initializer),
                        element
                    ),
                    element
                )
                : expression;
        }
        Debug.assertNode(element, isExpression);
        return <Expression>element;
    }

    export function convertToObjectAssignmentElement(element: BindingOrAssignmentElement) {
        if (isBindingElement(element)) {
            if (element.dotDotDotToken) {
                Debug.assertNode(element.name, isIdentifier);
                return setOriginalNode(setTextRange(createSpreadAssignment(<Identifier>element.name), element), element);
            }
            if (element.propertyName) {
                const expression = convertToAssignmentElementTarget(<ObjectBindingPattern | ArrayBindingPattern | Identifier>element.name);
                return setOriginalNode(setTextRange(createPropertyAssignment(element.propertyName, element.initializer ? createAssignment(expression, element.initializer) : expression), element), element);
            }
            Debug.assertNode(element.name, isIdentifier);
            return setOriginalNode(setTextRange(createShorthandPropertyAssignment(<Identifier>element.name, element.initializer), element), element);
        }
        Debug.assertNode(element, isObjectLiteralElementLike);
        return <ObjectLiteralElementLike>element;
    }

    export function convertToAssignmentPattern(node: BindingOrAssignmentPattern): AssignmentPattern {
        switch (node.kind) {
            case SyntaxKind.ArrayBindingPattern:
            case SyntaxKind.ArrayLiteralExpression:
                return convertToArrayAssignmentPattern(node);

            case SyntaxKind.ObjectBindingPattern:
            case SyntaxKind.ObjectLiteralExpression:
                return convertToObjectAssignmentPattern(node);
        }
    }

    export function convertToObjectAssignmentPattern(node: ObjectBindingOrAssignmentPattern) {
        if (isObjectBindingPattern(node)) {
            return setOriginalNode(
                setTextRange(
                    createObjectLiteral(map(node.elements, convertToObjectAssignmentElement)),
                    node
                ),
                node
            );
        }
        Debug.assertNode(node, isObjectLiteralExpression);
        return <ObjectLiteralExpression>node;
    }

    export function convertToArrayAssignmentPattern(node: ArrayBindingOrAssignmentPattern) {
        if (isArrayBindingPattern(node)) {
            return setOriginalNode(
                setTextRange(
                    createArrayLiteral(map(node.elements, convertToArrayAssignmentElement)),
                    node
                ),
                node
            );
        }
        Debug.assertNode(node, isArrayLiteralExpression);
        return <ArrayLiteralExpression>node;
    }

    export function convertToAssignmentElementTarget(node: BindingOrAssignmentElementTarget): Expression {
        if (isBindingPattern(node)) {
            return convertToAssignmentPattern(node);
        }

        Debug.assertNode(node, isExpression);
        return <Expression>node;
    }

    export interface ExternalModuleInfo {
        externalImports: (ImportDeclaration | ImportEqualsDeclaration | ExportDeclaration)[]; // imports of other external modules
        externalHelpersImportDeclaration: ImportDeclaration | undefined; // import of external helpers
        exportSpecifiers: Map<ExportSpecifier[]>; // export specifiers by name
        exportedBindings: Identifier[][]; // exported names of local declarations
        exportedNames: Identifier[]; // all exported names local to module
        exportEquals: ExportAssignment | undefined; // an export= declaration if one was present
        hasExportStarsToExportValues: boolean; // whether this module contains export*
    }

    export function collectExternalModuleInfo(sourceFile: SourceFile, resolver: EmitResolver, compilerOptions: CompilerOptions): ExternalModuleInfo {
        const externalImports: (ImportDeclaration | ImportEqualsDeclaration | ExportDeclaration)[] = [];
        const exportSpecifiers = createMultiMap<ExportSpecifier>();
        const exportedBindings: Identifier[][] = [];
        const uniqueExports = createMap<boolean>();
        let exportedNames: Identifier[];
        let hasExportDefault = false;
        let exportEquals: ExportAssignment = undefined;
        let hasExportStarsToExportValues = false;

        const externalHelpersModuleName = getOrCreateExternalHelpersModuleNameIfNeeded(sourceFile, compilerOptions);
        const externalHelpersImportDeclaration = externalHelpersModuleName && createImportDeclaration(
            /*decorators*/ undefined,
            /*modifiers*/ undefined,
            createImportClause(/*name*/ undefined, createNamespaceImport(externalHelpersModuleName)),
            createLiteral(externalHelpersModuleNameText));

        if (externalHelpersImportDeclaration) {
            externalImports.push(externalHelpersImportDeclaration);
        }

        for (const node of sourceFile.statements) {
            switch (node.kind) {
                case SyntaxKind.ImportDeclaration:
                    // import "mod"
                    // import x from "mod"
                    // import * as x from "mod"
                    // import { x, y } from "mod"
                    externalImports.push(<ImportDeclaration>node);
                    break;

                case SyntaxKind.ImportEqualsDeclaration:
                    if ((<ImportEqualsDeclaration>node).moduleReference.kind === SyntaxKind.ExternalModuleReference) {
                        // import x = require("mod")
                        externalImports.push(<ImportEqualsDeclaration>node);
                    }

                    break;

                case SyntaxKind.ExportDeclaration:
                    if ((<ExportDeclaration>node).moduleSpecifier) {
                        if (!(<ExportDeclaration>node).exportClause) {
                            // export * from "mod"
                            externalImports.push(<ExportDeclaration>node);
                            hasExportStarsToExportValues = true;
                        }
                        else {
                            // export { x, y } from "mod"
                            externalImports.push(<ExportDeclaration>node);
                        }
                    }
                    else {
                        // export { x, y }
                        for (const specifier of (<ExportDeclaration>node).exportClause.elements) {
                            if (!uniqueExports.get(specifier.name.text)) {
                                const name = specifier.propertyName || specifier.name;
                                exportSpecifiers.add(name.text, specifier);

                                const decl = resolver.getReferencedImportDeclaration(name)
                                    || resolver.getReferencedValueDeclaration(name);

                                if (decl) {
                                    multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(decl), specifier.name);
                                }

                                uniqueExports.set(specifier.name.text, true);
                                exportedNames = append(exportedNames, specifier.name);
                            }
                        }
                    }
                    break;

                case SyntaxKind.ExportAssignment:
                    if ((<ExportAssignment>node).isExportEquals && !exportEquals) {
                        // export = x
                        exportEquals = <ExportAssignment>node;
                    }
                    break;

                case SyntaxKind.VariableStatement:
                    if (hasModifier(node, ModifierFlags.Export)) {
                        for (const decl of (<VariableStatement>node).declarationList.declarations) {
                            exportedNames = collectExportedVariableInfo(decl, uniqueExports, exportedNames);
                        }
                    }
                    break;

                case SyntaxKind.FunctionDeclaration:
                    if (hasModifier(node, ModifierFlags.Export)) {
                        if (hasModifier(node, ModifierFlags.Default)) {
                            // export default function() { }
                            if (!hasExportDefault) {
                                multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(node), getDeclarationName(<FunctionDeclaration>node));
                                hasExportDefault = true;
                            }
                        }
                        else {
                            // export function x() { }
                            const name = (<FunctionDeclaration>node).name;
                            if (!uniqueExports.get(name.text)) {
                                multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(node), name);
                                uniqueExports.set(name.text, true);
                                exportedNames = append(exportedNames, name);
                            }
                        }
                    }
                    break;

                case SyntaxKind.ClassDeclaration:
                    if (hasModifier(node, ModifierFlags.Export)) {
                        if (hasModifier(node, ModifierFlags.Default)) {
                            // export default class { }
                            if (!hasExportDefault) {
                                multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(node), getDeclarationName(<ClassDeclaration>node));
                                hasExportDefault = true;
                            }
                        }
                        else {
                            // export class x { }
                            const name = (<ClassDeclaration>node).name;
                            if (!uniqueExports.get(name.text)) {
                                multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(node), name);
                                uniqueExports.set(name.text, true);
                                exportedNames = append(exportedNames, name);
                            }
                        }
                    }
                    break;
            }
        }

        return { externalImports, exportSpecifiers, exportEquals, hasExportStarsToExportValues, exportedBindings, exportedNames, externalHelpersImportDeclaration };
    }

    function collectExportedVariableInfo(decl: VariableDeclaration | BindingElement, uniqueExports: Map<boolean>, exportedNames: Identifier[]) {
        if (isBindingPattern(decl.name)) {
            for (const element of decl.name.elements) {
                if (!isOmittedExpression(element)) {
                    exportedNames = collectExportedVariableInfo(element, uniqueExports, exportedNames);
                }
            }
        }
        else if (!isGeneratedIdentifier(decl.name)) {
            if (!uniqueExports.get(decl.name.text)) {
                uniqueExports.set(decl.name.text, true);
                exportedNames = append(exportedNames, decl.name);
            }
        }
        return exportedNames;
    }

    /** Use a sparse array as a multi-map. */
    function multiMapSparseArrayAdd<V>(map: V[][], key: number, value: V): V[] {
        let values = map[key];
        if (values) {
            values.push(value);
        }
        else {
            map[key] = values = [value];
        }
        return values;
    }
}
