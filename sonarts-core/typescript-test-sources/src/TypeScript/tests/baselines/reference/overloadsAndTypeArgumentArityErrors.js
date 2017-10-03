//// [overloadsAndTypeArgumentArityErrors.ts]
declare function Callbacks(flags?: string): void;
declare function Callbacks<T>(flags?: string): void;
declare function Callbacks<T1, T2>(flags?: string): void;

Callbacks<number, string, boolean>('s'); // wrong number of type arguments
new Callbacks<number, string, boolean>('s'); // wrong number of type arguments

//// [overloadsAndTypeArgumentArityErrors.js]
Callbacks('s'); // wrong number of type arguments
new Callbacks('s'); // wrong number of type arguments
