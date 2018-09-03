  function nok(p1: number, p2: number, p3: number, p4: number, p5: number, p6: number, p7: number, p8: number) {
//^^^^^^^^ {{This function has 8 parameters, which is greater than the 7 authorized.}}

}

function ok(p1: number, p2: number, p3: number, p4: number, p5: number, p6: number, p7: number) { }


class Foo {
  // OK, class constructor with parameter properties are excluded
  public constructor(
    private store: Store,
    private scuttlebot: ScuttlebotService,
    private electron: ElectronService,
    private router: Router,
    private helper: HelperService,
    public elementRef: ElementRef,
    private _hotkeysService: HotkeysService,
    private _scrollService: ScrollToService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }
}

class Bar {
  // OK, class constructor with parameter properties are excluded
  public constructor(
//       ^^^^^^^^^^^ {{This function has 8 parameters, which is greater than the 7 authorized.}}
    private store: Store,
    scuttlebot: ScuttlebotService,
    electron: ElectronService,
    router: Router,
    helper: HelperService,
    elementRef: ElementRef,
    _hotkeysService: HotkeysService,
    _scrollService: ScrollToService,
    changeDetectorRef: ChangeDetectorRef,
  ) { }
}
