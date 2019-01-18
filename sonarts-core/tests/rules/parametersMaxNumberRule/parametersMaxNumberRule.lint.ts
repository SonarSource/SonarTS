export function toCreateModule() {}
 
  function nok(p1: number, p2: number, p3: number, p4: number, p5: number, p6: number, p7: number, p8: number) {
//^^^^^^^^ {{This function has 8 parameters, which is greater than the 7 authorized.}}

}

function ok(p1: number, p2: number, p3: number, p4: number, p5: number, p6: number, p7: number) { }


class Foo {
  // OK, class constructor with parameter properties are excluded
  public constructor(
    private p1: number,
    private p2: number,
    private p3: number,
    private p4: number,
    private p5: number,
    public p6:  number,
    private p7: number,
    private p8: number,
    private p9: number
  ) { }
}

class Bar {
  public constructor(
//       ^^^^^^^^^^^ {{This function has 8 parameters, which is greater than the 7 authorized.}}
    private p1: number,
    p2: number,
    p3: number,
    p4: number,
    p5: number,
    p6: number,
    p7: number,
    p8: number,
    p9: number
  ) { }
}
