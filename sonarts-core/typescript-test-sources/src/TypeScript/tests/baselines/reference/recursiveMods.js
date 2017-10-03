//// [recursiveMods.ts]
export module Foo {
	export class C {}
}

export module Foo {

	function Bar() : C {
		if (true) { return Bar();}
		return new C();
	}

	function Baz() : C {
		var c = Baz();
		return Bar();
	}

	function Gar() {
		var c : C = Baz();
		return;
	}
	
}


//// [recursiveMods.js]
"use strict";
exports.__esModule = true;
var Foo;
(function (Foo) {
    var C = (function () {
        function C() {
        }
        return C;
    }());
    Foo.C = C;
})(Foo = exports.Foo || (exports.Foo = {}));
(function (Foo) {
    function Bar() {
        if (true) {
            return Bar();
        }
        return new Foo.C();
    }
    function Baz() {
        var c = Baz();
        return Bar();
    }
    function Gar() {
        var c = Baz();
        return;
    }
})(Foo = exports.Foo || (exports.Foo = {}));
