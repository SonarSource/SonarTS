

function foo() {
  const custom = "asdasd";
//               ^^^^^^^^ {{Review this potentially hardcoded credential.}}
  const other = "asdasd";
//              ^^^^^^^^ {{Review this potentially hardcoded credential.}}

  const password = "this is fine";
}
