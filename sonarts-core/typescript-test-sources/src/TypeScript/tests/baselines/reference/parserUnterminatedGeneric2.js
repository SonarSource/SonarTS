//// [parserUnterminatedGeneric2.ts]
declare module ng {
    interfaceICompiledExpression {
        (context: any, locals?: any): any;
        assign(context: any, value: any): any;
    }

    interface IQService {
        all(promises: IPromise < any > []): IPromise<

//// [parserUnterminatedGeneric2.js]
