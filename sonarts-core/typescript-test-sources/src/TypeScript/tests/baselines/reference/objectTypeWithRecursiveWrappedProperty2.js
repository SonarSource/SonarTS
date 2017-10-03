//// [objectTypeWithRecursiveWrappedProperty2.ts]
// Basic recursive type

class List<T> {
    data: T;
    next: List<List<T>>;
}

var list1 = new List<number>();
var list2 = new List<number>();
var list3 = new List<string>();

list1 = list2; // ok
list1 = list3; // error

//// [objectTypeWithRecursiveWrappedProperty2.js]
// Basic recursive type
var List = (function () {
    function List() {
    }
    return List;
}());
var list1 = new List();
var list2 = new List();
var list3 = new List();
list1 = list2; // ok
list1 = list3; // error
