export function toCreateModule() {}

interface Person {
  age: number;
  name: string;
}

interface Loggable<T> {
  log(param: T): string;
}

type nokUDuplicate = number | number | string;
//                            ^^^^^^ {{Remove this duplicated type or replace with another one.}}
// [12:21-12:27] < {{Original}}

type nokUDuplicate2 = number | number | number | string;
//                             ^^^^^^ {{Remove this duplicated type or replace with another one.}}
// [16:22-16:28] < {{Original}}
// [16:40-16:46] < {{Another duplicate}}

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
// [36:21-36:27] < {{Original}}

type nokIDuplicate2 = number & number & number & string;
//                             ^^^^^^ {{Remove this duplicated type or replace with another one.}}
// [40:22-40:28] < {{Original}}
// [40:40-40:46] < {{Another duplicate}}

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
