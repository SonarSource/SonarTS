const tsc = require('typescript');
const babel = require('babel-core');

module.exports = {
  process(src, path) {
    const tsoutput = tsc.transpile(src, {
      module: tsc.ModuleKind.CommonJS,
      jsx: tsc.JsxEmit.React,
    }, path, [])

    return babel.transform(tsoutput).code
  },
}
