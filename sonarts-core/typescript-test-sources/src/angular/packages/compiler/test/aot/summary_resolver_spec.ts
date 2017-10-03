/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotSummaryResolver, AotSummaryResolverHost, CompileSummaryKind, CompileTypeSummary, ResolvedStaticSymbol, StaticSymbol, StaticSymbolCache, StaticSymbolResolver} from '@angular/compiler';
import {deserializeSummaries, serializeSummaries} from '@angular/compiler/src/aot/summary_serializer';
import * as path from 'path';

import {MockStaticSymbolResolverHost, MockSummaryResolver} from './static_symbol_resolver_spec';

const EXT = /(\.d)?\.ts$/;

export function main() {
  describe('AotSummaryResolver', () => {
    let summaryResolver: AotSummaryResolver;
    let symbolCache: StaticSymbolCache;
    let host: MockAotSummaryResolverHost;

    beforeEach(() => { symbolCache = new StaticSymbolCache(); });

    function init(summaries: {[filePath: string]: string} = {}) {
      host = new MockAotSummaryResolverHost(summaries);
      summaryResolver = new AotSummaryResolver(host, symbolCache);
    }

    function serialize(symbols: ResolvedStaticSymbol[]): string {
      // Note: Don't use the top level host / summaryResolver as they might not be created yet
      const mockSummaryResolver = new MockSummaryResolver([]);
      const symbolResolver = new StaticSymbolResolver(
          new MockStaticSymbolResolverHost({}), symbolCache, mockSummaryResolver);
      return serializeSummaries(mockSummaryResolver, symbolResolver, symbols, []).json;
    }

    it('should load serialized summary files', () => {
      const asymbol = symbolCache.get('/a.d.ts', 'a');
      init({'/a.ngsummary.json': serialize([{symbol: asymbol, metadata: 1}])});
      expect(summaryResolver.resolveSummary(asymbol)).toEqual({symbol: asymbol, metadata: 1});
    });

    it('should not load summaries for source files', () => {
      init({});
      spyOn(host, 'loadSummary').and.callThrough();

      expect(summaryResolver.resolveSummary(symbolCache.get('/a.ts', 'a'))).toBeFalsy();
      expect(host.loadSummary).not.toHaveBeenCalled();
    });

    it('should cache summaries', () => {
      const asymbol = symbolCache.get('/a.d.ts', 'a');
      init({'/a.ngsummary.json': serialize([{symbol: asymbol, metadata: 1}])});
      expect(summaryResolver.resolveSummary(asymbol)).toBe(summaryResolver.resolveSummary(asymbol));
    });

    it('should return all symbols in a summary', () => {
      const asymbol = symbolCache.get('/a.d.ts', 'a');
      init({'/a.ngsummary.json': serialize([{symbol: asymbol, metadata: 1}])});
      expect(summaryResolver.getSymbolsOf('/a.d.ts')).toEqual([asymbol]);
    });

    it('should fill importAs for deep symbols', () => {
      const libSymbol = symbolCache.get('/lib.d.ts', 'Lib');
      const srcSymbol = symbolCache.get('/src.ts', 'Src');
      init({
        '/src.ngsummary.json':
            serialize([{symbol: srcSymbol, metadata: 1}, {symbol: libSymbol, metadata: 2}])
      });
      summaryResolver.getSymbolsOf('/src.d.ts');

      expect(summaryResolver.getImportAs(symbolCache.get('/src.d.ts', 'Src'))).toBeFalsy();
      expect(summaryResolver.getImportAs(libSymbol))
          .toBe(symbolCache.get('/src.ngfactory.d.ts', 'Lib_1'));
    });

    describe('isLibraryFile', () => {
      it('should use host.isSourceFile to calculate the result', () => {
        init();
        expect(summaryResolver.isLibraryFile('someFile.ts')).toBe(false);
        expect(summaryResolver.isLibraryFile('someFile.d.ts')).toBe(true);
      });

      it('should calculate the result for generated files based on the result for non generated files',
         () => {
           init();
           spyOn(host, 'isSourceFile').and.callThrough();
           expect(summaryResolver.isLibraryFile('someFile.ngfactory.ts')).toBe(false);
           expect(host.isSourceFile).toHaveBeenCalledWith('someFile.ts');
         });
    });
  });
}


export class MockAotSummaryResolverHost implements AotSummaryResolverHost {
  constructor(private summaries: {[fileName: string]: string}) {}

  fileNameToModuleName(fileName: string): string {
    return './' + path.basename(fileName).replace(EXT, '');
  }

  getOutputFileName(sourceFileName: string): string {
    return sourceFileName.replace(EXT, '') + '.d.ts';
  }

  isSourceFile(filePath: string) { return !filePath.endsWith('.d.ts'); }

  loadSummary(filePath: string): string { return this.summaries[filePath]; }
}