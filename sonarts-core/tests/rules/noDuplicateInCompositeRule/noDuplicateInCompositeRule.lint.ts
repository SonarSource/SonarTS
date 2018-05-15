interface Person {
  age: number;
  name: string;
}

interface Loggable<T> {
  log(param: T): string;
}

type nokUDuplicate = number | number | string;
// [10:30-10:36] {{Remove this duplicated type or replace with another one.}}
// [10:21-10:27] < {{Original}}

type nokUDuplicate2 = number | number | number | string;
// [14:31-14:37] {{Remove this duplicated type or replace with another one.}}
// [14:22-14:28] < {{Original}}
// [14:40-14:46] < {{Another duplicate}}

type nokUFunctionType = ((a: boolean) => boolean) | ((a: boolean) => boolean)
// [19:52-19:77] {{Remove this duplicated type or replace with another one.}}
// [19:24-19:49] < {{Original}}

type nokUTuple = [boolean, number] | [boolean, number]
// [23:37-23:54] {{Remove this duplicated type or replace with another one.}}
// [23:17-23:34] < {{Original}}

type nokUArray = number [] | number []
// [27:29-27:38] {{Remove this duplicated type or replace with another one.}}
// [27:17-27:26] < {{Original}}

type nokUStringLiteral = "ValueA" | "ValueA"
// [31:36-31:44] {{Remove this duplicated type or replace with another one.}}
// [31:25-31:33] < {{Original}}

type nokUUnion = (number | string) | (number | string)
// [35:37-35:54] {{Remove this duplicated type or replace with another one.}}
// [35:17-35:34] < {{Original}}

type nokIDuplicate = Person & Person & Loggable<Person>;
// [39:30-39:36] {{Remove this duplicated type or replace with another one.}}
// [39:21-39:27] < {{Original}}

type nokIDuplicate2 = number & number & number & string;
// [43:31-43:37] {{Remove this duplicated type or replace with another one.}}
// [43:22-43:28] < {{Original}}
// [43:40-43:46] < {{Another duplicate}}

type nokIFunctionType = ((a: boolean) => boolean) & ((a: boolean) => boolean)
// [48:52-48:77] {{Remove this duplicated type or replace with another one.}}
// [48:24-48:49] < {{Original}}

type nokITuple = [boolean, number] & [boolean, number]
// [52:37-52:54] {{Remove this duplicated type or replace with another one.}}
// [52:17-52:34] < {{Original}}

type nokIArray = number [] & number []
// [56:29-56:38] {{Remove this duplicated type or replace with another one.}}
// [56:17-56:26] < {{Original}}

type nokIStringLiteral = "ValueA" & "ValueA"
// [60:36-60:44] {{Remove this duplicated type or replace with another one.}}
// [60:25-60:33] < {{Original}}

type nokIUnion = (number | string) & (number | string)
// [64:37-64:54] {{Remove this duplicated type or replace with another one.}}
// [64:17-64:34] < {{Original}}

type okUnion = number | string;

type okUnionWithDifferentTypeParam = Loggable<number> | Loggable<string>;

type okIntersection = Person & Loggable<Person>;
