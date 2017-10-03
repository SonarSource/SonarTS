//// [staticOffOfInstance2.ts]
class List<T> {
    public Blah() {
        this.Foo(); // no error
        List.Foo();
    }
    public static Foo() { }
}


//// [staticOffOfInstance2.js]
var List = (function () {
    function List() {
    }
    List.prototype.Blah = function () {
        this.Foo(); // no error
        List.Foo();
    };
    List.Foo = function () { };
    return List;
}());
