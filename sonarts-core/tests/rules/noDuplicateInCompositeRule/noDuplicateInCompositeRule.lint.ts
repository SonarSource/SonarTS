interface Person {
  age: number;
  name: string;
}

interface Loggable<T> {
  log(param: T): string;
}

type nokUDuplicate = number | number | string;
//                            ^^^^^^ {{Remove this duplicated type or replace with another one.}}
// [10:21-10:27] < {{Original}}

type nokUDuplicate2 = number | number | number | string;
//                             ^^^^^^ {{Remove this duplicated type or replace with another one.}}
// [14:22-14:28] < {{Original}}
// [14:40-14:46] < {{Another duplicate}}

type nokUFunctionType = ((a: boolean) => boolean) | ((a: boolean) => boolean)
//                                                  ^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type nokUTuple = [boolean, number] | [boolean, number]
//                                   ^^^^^^^^^^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type nokUArray = number [] | number []
//                           ^^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type nokUStringLiteral = "ValueA" | "ValueA"
//                                  ^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type nokUUnion = (number | string) | (number | string)
//                                   ^^^^^^^^^^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type nokIDuplicate = Person & Person & Loggable<Person>;
//                            ^^^^^^ {{Remove this duplicated type or replace with another one.}}
// [34:21-34:27] < {{Original}}

type nokIDuplicate2 = number & number & number & string;
//                             ^^^^^^ {{Remove this duplicated type or replace with another one.}}
// [38:22-38:28] < {{Original}}
// [38:40-38:46] < {{Another duplicate}}

type nokIFunctionType = ((a: boolean) => boolean) & ((a: boolean) => boolean)
//                                                  ^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type nokITuple = [boolean, number] & [boolean, number]
//                                   ^^^^^^^^^^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type nokIArray = number [] & number []
//                           ^^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type nokIStringLiteral = "ValueA" & "ValueA"
//                                  ^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type nokIUnion = (number | string) & (number | string)
//                                   ^^^^^^^^^^^^^^^^^ {{Remove this duplicated type or replace with another one.}}

type okUnion = number | string;

type okUnionWithDifferentTypeParam = Loggable<number> | Loggable<string>;

type okIntersection = Person & Loggable<Person>;
