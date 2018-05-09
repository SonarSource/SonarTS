type nokUnionDuplicate = number | number | string;
//                                ^^^^^^ {{Remove this duplicated type.}}

type nokIntersectionDuplicate = Person & Person & Loggable<Person>;
//                                       ^^^^^^ {{Remove this duplicated type.}}

type nokUnionDuplicate2 = number | number | number | string;
//                                 ^^^^^^ {{Remove this duplicated type.}}

interface Person {
  age: number;
  name: string;
}

interface Loggable<T> {
  log(param: T): string;
}

type okUnion = number | string;

type okUnionWithDifferentTypeParam = Loggable<number> | Loggable<string>;

type okIntersection = Person & Loggable<Person>;
