class Book {}

collect(new Book(), new Book());

function collect(...books: Book[]) {
  buy(books);   
//    ^^^^^ {{Use spread operator '...' to pass this argument}}
  buyArray(books);   
//         ^^^^^ {{Use spread operator '...' to pass this argument}}

  // OK
  buy(...books); 

  buyWithoutRest(books);

  buyNotAny(books);

  twoParameters(books);
}

function buy(...things: any[]) {
}

function buyArray(...things: Array<any>) {
}

function buyWithoutRest(things: any[]) {
}

function buyNotAny(...things: Book[][]) {
}

function twoParameters(first: any[], ... rest: any[]) {}
