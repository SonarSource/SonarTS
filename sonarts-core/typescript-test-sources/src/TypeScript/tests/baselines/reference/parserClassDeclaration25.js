//// [parserClassDeclaration25.ts]
interface IList<T> {
    data(): T;
    next(): string;
}
class List<U> implements IList<U> {
    data(): U;
    next(): string;
}


//// [parserClassDeclaration25.js]
var List = (function () {
    function List() {
    }
    return List;
}());
