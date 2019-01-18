export function toCreateModule() {}

var arrayOfNumbers = [80, 3, 9, 34, 23, 5, 1];
  arrayOfNumbers.sort();
               //^^^^ {{Provide a compare function to avoid sorting elements alphabetically.}}

arrayOfNumbers.sort((n, m) => n - m); // OK


var emptyArrayOfNumbers: number[] = [];
emptyArrayOfNumbers.sort();
                  //^^^^ {{Provide a compare function to avoid sorting elements alphabetically.}}

sort(); // OK

function getArrayOfNumbers(): number[] { }
getArrayOfNumbers().sort();
//                  ^^^^{{Provide a compare function to avoid sorting elements alphabetically.}}

var arrayOfStrings = ["foo", "bar"];
arrayOfStrings.sort(); // OK

var arrayOfObjects = [{a: 2}, {a: 4}];
arrayOfObjects.sort(); // OK

unknownArrayType.sort(); // OK

interface MyCustomNumber extends Number {}
const arrayOfCustomNumbers: MyCustomNumber[];
arrayOfCustomNumbers.sort(); // OK
