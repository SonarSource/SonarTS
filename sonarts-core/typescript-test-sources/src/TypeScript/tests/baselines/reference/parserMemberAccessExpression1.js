//// [parserMemberAccessExpression1.ts]
Foo<T>();
Foo.Bar<T>();
Foo<T>.Bar();
Foo<T>.Bar<T>();


//// [parserMemberAccessExpression1.js]
Foo();
Foo.Bar();
Foo(Bar());
Foo(Bar());
