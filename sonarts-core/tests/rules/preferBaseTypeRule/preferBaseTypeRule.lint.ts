class Base { 
  baseMethod() {}
}

class Middle extends Base { 
  middleMethod() {}
}

class Child extends Middle { 
  childMethod() { }
}

function testMiddleClass(param: Child) {  
//                              ^^^^^ {{Use 'Middle' here; it is a more general type than 'Child'.}}
  param.middleMethod();
}

function testBaseClass(param: Child) {  
//                            ^^^^^ {{Use 'Base' here; it is a more general type than 'Child'.}}
  param.baseMethod();
}

function testMiddleDeclared(param: Middle) {
//                                 ^^^^^^ {{Use 'Base' here; it is a more general type than 'Middle'.}}
  param.baseMethod();
}

function okWhenMethodOfChildUsed(param: Child) {
  param.childMethod();
}

function okWhenObjectPropUsed(param: Child) {
  param.baseMethod();
  return param.toString();
}

function okWhenComplexParameter({x, y}: {x: Child, y: number}) {
  x.baseMethod();
}

let okWhenArrowFunction = (param: Middle) => {
  param.baseMethod();
}

import DefaultExport from './dep';
class ImportedClassChild extends DefaultExport { }

function foo8(b: ImportedClassChild) {
//               ^^^^^^^^^^^^^^^^^^ {{Use the parent type here; it is a more general type than 'ImportedClassChild'.}}
  b.baseMethod();
}

// rule does not work for interfaces
interface MyInterface { 
  interfaceMethod(): void 
}

class MyClass implements MyInterface { 
  interfaceMethod() {  /* ... */ }
  submerge(depth: number) { /* ... */ }
}

function okForInterface(param: MyClass) {
  param.interfaceMethod();
} 

function okWhenParameterWithoutType(paramWithoutType) {
  return paramWithoutType;
}
