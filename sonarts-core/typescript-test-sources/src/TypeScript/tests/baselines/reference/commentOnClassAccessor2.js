//// [commentOnClassAccessor2.ts]
class C {
  /**
   * Getter.
   */
  get bar(): number { return 1;}

  /**
   * Setter.
   */
  set bar(v) { }
}

//// [commentOnClassAccessor2.js]
var C = (function () {
    function C() {
    }
    Object.defineProperty(C.prototype, "bar", {
        /**
         * Getter.
         */
        get: function () { return 1; },
        /**
         * Setter.
         */
        set: function (v) { },
        enumerable: true,
        configurable: true
    });
    return C;
}());
