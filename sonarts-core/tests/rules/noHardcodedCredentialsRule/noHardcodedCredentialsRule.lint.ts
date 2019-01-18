export function toCreateModule() {}

function foo() {
  const password = "asdasd";
//                 ^^^^^^^^ {{Review this potentially hardcoded credential.}}

  let my_pwd;
  my_pwd = "qwerewt";
//         ^^^^^^^^^ {{Review this potentially hardcoded credential.}}

  let o = { passwd: "zxvxcv"};
//                  ^^^^^^^^ {{Review this potentially hardcoded credential.}}

  const obj = { password: "" } // empty is OK
}

function insideLiteral() {
  const url = "https://example.com?password=hl2OAIXXZ60";
//            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Review this potentially hardcoded credential.}}
}
