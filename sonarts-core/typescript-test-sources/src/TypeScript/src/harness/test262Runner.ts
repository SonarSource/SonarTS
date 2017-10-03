/// <reference path="harness.ts" />
/// <reference path="runnerbase.ts" />
// In harness baselines, null is different than undefined. See `generateActual` in `harness.ts`.
/* tslint:disable:no-null-keyword */

class Test262BaselineRunner extends RunnerBase {
    private static basePath = "internal/cases/test262";
    private static helpersFilePath = "tests/cases/test262-harness/helpers.d.ts";
    private static helperFile: Harness.Compiler.TestFile = {
        unitName: Test262BaselineRunner.helpersFilePath,
        content: Harness.IO.readFile(Test262BaselineRunner.helpersFilePath),
    };
    private static testFileExtensionRegex = /\.js$/;
    private static options: ts.CompilerOptions = {
        allowNonTsExtensions: true,
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.CommonJS
    };
    private static baselineOptions: Harness.Baseline.BaselineOptions = {
        Subfolder: "test262",
        Baselinefolder: "internal/baselines"
    };

    private static getTestFilePath(filename: string): string {
        return Test262BaselineRunner.basePath + "/" + filename;
    }

    private runTest(filePath: string) {
        describe("test262 test for " + filePath, () => {
            // Mocha holds onto the closure environment of the describe callback even after the test is done.
            // Everything declared here should be cleared out in the "after" callback.
            let testState: {
                filename: string;
                compilerResult: Harness.Compiler.CompilerResult;
                inputFiles: Harness.Compiler.TestFile[];
            };

            before(() => {
                const content = Harness.IO.readFile(filePath);
                const testFilename = ts.removeFileExtension(filePath).replace(/\//g, "_") + ".test";
                const testCaseContent = Harness.TestCaseParser.makeUnitsFromTest(content, testFilename);

                const inputFiles: Harness.Compiler.TestFile[] = testCaseContent.testUnitData.map(unit => {
                    const unitName = Test262BaselineRunner.getTestFilePath(unit.name);
                    return { unitName, content: unit.content };
                });

                // Emit the results
                testState = {
                    filename: testFilename,
                    inputFiles: inputFiles,
                    compilerResult: undefined,
                };

                const output = Harness.Compiler.compileFiles(
                    [Test262BaselineRunner.helperFile].concat(inputFiles),
                    /*otherFiles*/ [],
                    /* harnessOptions */ undefined,
                    Test262BaselineRunner.options,
                    /* currentDirectory */ undefined
                    );
                testState.compilerResult = output.result;
            });

            after(() => {
                testState = undefined;
            });

            it("has the expected emitted code", () => {
                Harness.Baseline.runBaseline(testState.filename + ".output.js", () => {
                    const files = testState.compilerResult.files.filter(f => f.fileName !== Test262BaselineRunner.helpersFilePath);
                    return Harness.Compiler.collateOutputs(files);
                }, Test262BaselineRunner.baselineOptions);
            });

            it("has the expected errors", () => {
                Harness.Baseline.runBaseline(testState.filename + ".errors.txt", () => {
                    const errors = testState.compilerResult.errors;
                    if (errors.length === 0) {
                        return null;
                    }

                    return Harness.Compiler.getErrorBaseline(testState.inputFiles, errors);
                }, Test262BaselineRunner.baselineOptions);
            });

            it("satisfies invariants", () => {
                const sourceFile = testState.compilerResult.program.getSourceFile(Test262BaselineRunner.getTestFilePath(testState.filename));
                Utils.assertInvariants(sourceFile, /*parent:*/ undefined);
            });

            it("has the expected AST", () => {
                Harness.Baseline.runBaseline(testState.filename + ".AST.txt", () => {
                    const sourceFile = testState.compilerResult.program.getSourceFile(Test262BaselineRunner.getTestFilePath(testState.filename));
                    return Utils.sourceFileToJSON(sourceFile);
                }, Test262BaselineRunner.baselineOptions);
            });
        });
    }

    public kind(): TestRunnerKind {
        return "test262";
    }

    public enumerateTestFiles() {
        return ts.map(this.enumerateFiles(Test262BaselineRunner.basePath, Test262BaselineRunner.testFileExtensionRegex, { recursive: true }), ts.normalizePath);
    }

    public initializeTests() {
        // this will set up a series of describe/it blocks to run between the setup and cleanup phases
        if (this.tests.length === 0) {
            const testFiles = this.enumerateTestFiles();
            testFiles.forEach(fn => {
                this.runTest(fn);
            });
        }
        else {
            this.tests.forEach(test => this.runTest(test));
        }
    }
}
