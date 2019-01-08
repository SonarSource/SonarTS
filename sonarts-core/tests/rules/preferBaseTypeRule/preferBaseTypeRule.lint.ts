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


export default class {
  baseMethod() {}
}  

import DefaultExport from './preferBaseTypeRule.lint';
class ImportedClassChild extends DefaultExport { }

function foo8(b: ImportedClassChild) {
//               ^^^^^^^^^^^^^^^^^^ {{Use the parent type here; it is a more general type than 'ImportedClassChild'.}}
  b.baseMethod();
}

interface InterfaceA { 
  methodA(): void 
}

interface InterfaceAA { 
  methodAA(): void 
}

class ClassB implements InterfaceA {
  methodA() {}
  methodB() {}
}
interface InterfaceB extends InterfaceA {
  methodB(): void
}
interface InterfaceBB extends InterfaceA, InterfaceAA {
  methodB(): void
}

function testBaseInteface(param: InterfaceB) {
//                               ^^^^^^^^^^ {{Use 'InterfaceA' here; it is a more general type than 'InterfaceB'.}}
  param.methodA();
}



// type checker does not provide infomation about implemented by class interfaces
function okClassImplementingInterface(param: ClassB) {
  param.methodA();
}

function okWhenParameterWithoutType(paramWithoutType) {
  return paramWithoutType;
}
