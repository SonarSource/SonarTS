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
//                              ^^^^^ {{Consider using 'Middle' here; no specific properties of 'Child' are used.}}
  param.middleMethod();
}

function testBaseClass(param: Child) {  
//                            ^^^^^ {{Consider using 'Base' here; no specific properties of 'Child' are used.}}
  param.baseMethod();
}

function testMiddleDeclared(param: Middle) {
//                                 ^^^^^^ {{Consider using 'Base' here; no specific properties of 'Middle' are used.}}
  param.baseMethod();
}

function okWhenUsedWithoutProperty(param: Middle) {
  param.baseMethod();
  return param;
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

let okWhenFunctionExpression = function(param: Middle) {
  param.baseMethod();
}


export default class {
  baseMethod() {}
}  

import DefaultExport from './preferBaseTypeRule.lint';
class ImportedClassChild extends DefaultExport { }

function testDefaultExportedClass(b: ImportedClassChild) {
//                                   ^^^^^^^^^^^^^^^^^^ {{Consider using the parent type here; no specific properties of 'ImportedClassChild' are used.}}
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
//                               ^^^^^^^^^^ {{Consider using 'InterfaceA' here; no specific properties of 'InterfaceB' are used.}}
  param.methodA();
}

function testManyBaseIntefacesAA(param: InterfaceBB) {
//                                      ^^^^^^^^^^^ {{Consider using 'InterfaceAA' here; no specific properties of 'InterfaceBB' are used.}}
  param.methodAA();
}

function testManyBaseIntefacesA(param: InterfaceBB) {
//                                     ^^^^^^^^^^^ {{Consider using 'InterfaceA' here; no specific properties of 'InterfaceBB' are used.}}
  param.methodA();
}

// type checker does not provide infomation about implemented by class interfaces
function okClassImplementingInterface(param: ClassB) {
  param.methodA();
}

function okWhenParameterWithoutType(paramWithoutType) {
  return paramWithoutType;
}

function okForNotClassType(param: number[]) {
  return param.toString();
}

interface InterfaceX extends InterfaceY {
  methodX(): void
}

interface InterfaceY extends InterfaceX {
  methodX(): void
  methodY(): void
}

function okCircularInheritance(param: InterfaceY) {
  param.methodX();
}
