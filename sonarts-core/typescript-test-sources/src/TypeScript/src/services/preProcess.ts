namespace ts {
    export function preProcessFile(sourceText: string, readImportFiles = true, detectJavaScriptImports = false): PreProcessedFileInfo {
        const referencedFiles: FileReference[] = [];
        const typeReferenceDirectives: FileReference[] = [];
        const importedFiles: FileReference[] = [];
        let ambientExternalModules: { ref: FileReference, depth: number }[];
        let isNoDefaultLib = false;
        let braceNesting = 0;
        // assume that text represent an external module if it contains at least one top level import/export
        // ambient modules that are found inside external modules are interpreted as module augmentations
        let externalModule = false;

        function nextToken() {
            const token = scanner.scan();
            if (token === SyntaxKind.OpenBraceToken) {
                braceNesting++;
            }
            else if (token === SyntaxKind.CloseBraceToken) {
                braceNesting--;
            }
            return token;
        }

        function processTripleSlashDirectives(): void {
            const commentRanges = getLeadingCommentRanges(sourceText, 0);
            forEach(commentRanges, commentRange => {
                const comment = sourceText.substring(commentRange.pos, commentRange.end);
                const referencePathMatchResult = getFileReferenceFromReferencePath(comment, commentRange);
                if (referencePathMatchResult) {
                    isNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
                    const fileReference = referencePathMatchResult.fileReference;
                    if (fileReference) {
                        const collection = referencePathMatchResult.isTypeReferenceDirective
                            ? typeReferenceDirectives
                            : referencedFiles;

                        collection.push(fileReference);
                    }
                }
            });
        }

        function getFileReference() {
            const file = scanner.getTokenValue();
            const pos = scanner.getTokenPos();
            return {
                fileName: file,
                pos: pos,
                end: pos + file.length
            };
        }

        function recordAmbientExternalModule(): void {
            if (!ambientExternalModules) {
                ambientExternalModules = [];
            }
            ambientExternalModules.push({ ref: getFileReference(), depth: braceNesting });
        }

        function recordModuleName() {
            importedFiles.push(getFileReference());

            markAsExternalModuleIfTopLevel();
        }

        function markAsExternalModuleIfTopLevel() {
            if (braceNesting === 0) {
                externalModule = true;
            }
        }

        /**
         * Returns true if at least one token was consumed from the stream
         */
        function tryConsumeDeclare(): boolean {
            let token = scanner.getToken();
            if (token === SyntaxKind.DeclareKeyword) {
                // declare module "mod"
                token = nextToken();
                if (token === SyntaxKind.ModuleKeyword) {
                    token = nextToken();
                    if (token === SyntaxKind.StringLiteral) {
                        recordAmbientExternalModule();
                    }
                }
                return true;
            }

            return false;
        }

        /**
         * Returns true if at least one token was consumed from the stream
         */
        function tryConsumeImport(): boolean {
            let token = scanner.getToken();
            if (token === SyntaxKind.ImportKeyword) {

                token = nextToken();
                if (token === SyntaxKind.StringLiteral) {
                    // import "mod";
                    recordModuleName();
                    return true;
                }
                else {
                    if (token === SyntaxKind.Identifier || isKeyword(token)) {
                        token = nextToken();
                        if (token === SyntaxKind.FromKeyword) {
                            token = nextToken();
                            if (token === SyntaxKind.StringLiteral) {
                                // import d from "mod";
                                recordModuleName();
                                return true;
                            }
                        }
                        else if (token === SyntaxKind.EqualsToken) {
                            if (tryConsumeRequireCall(/*skipCurrentToken*/ true)) {
                                return true;
                            }
                        }
                        else if (token === SyntaxKind.CommaToken) {
                            // consume comma and keep going
                            token = nextToken();
                        }
                        else {
                            // unknown syntax
                            return true;
                        }
                    }

                    if (token === SyntaxKind.OpenBraceToken) {
                        token = nextToken();
                        // consume "{ a as B, c, d as D}" clauses
                        // make sure that it stops on EOF
                        while (token !== SyntaxKind.CloseBraceToken && token !== SyntaxKind.EndOfFileToken) {
                            token = nextToken();
                        }

                        if (token === SyntaxKind.CloseBraceToken) {
                            token = nextToken();
                            if (token === SyntaxKind.FromKeyword) {
                                token = nextToken();
                                if (token === SyntaxKind.StringLiteral) {
                                    // import {a as A} from "mod";
                                    // import d, {a, b as B} from "mod"
                                    recordModuleName();
                                }
                            }
                        }
                    }
                    else if (token === SyntaxKind.AsteriskToken) {
                        token = nextToken();
                        if (token === SyntaxKind.AsKeyword) {
                            token = nextToken();
                            if (token === SyntaxKind.Identifier || isKeyword(token)) {
                                token = nextToken();
                                if (token === SyntaxKind.FromKeyword) {
                                    token = nextToken();
                                    if (token === SyntaxKind.StringLiteral) {
                                        // import * as NS from "mod"
                                        // import d, * as NS from "mod"
                                        recordModuleName();
                                    }
                                }
                            }
                        }
                    }
                }

                return true;
            }

            return false;
        }

        function tryConsumeExport(): boolean {
            let token = scanner.getToken();
            if (token === SyntaxKind.ExportKeyword) {
                markAsExternalModuleIfTopLevel();
                token = nextToken();
                if (token === SyntaxKind.OpenBraceToken) {
                    token = nextToken();
                    // consume "{ a as B, c, d as D}" clauses
                    // make sure it stops on EOF
                    while (token !== SyntaxKind.CloseBraceToken && token !== SyntaxKind.EndOfFileToken) {
                        token = nextToken();
                    }

                    if (token === SyntaxKind.CloseBraceToken) {
                        token = nextToken();
                        if (token === SyntaxKind.FromKeyword) {
                            token = nextToken();
                            if (token === SyntaxKind.StringLiteral) {
                                // export {a as A} from "mod";
                                // export {a, b as B} from "mod"
                                recordModuleName();
                            }
                        }
                    }
                }
                else if (token === SyntaxKind.AsteriskToken) {
                    token = nextToken();
                    if (token === SyntaxKind.FromKeyword) {
                        token = nextToken();
                        if (token === SyntaxKind.StringLiteral) {
                            // export * from "mod"
                            recordModuleName();
                        }
                    }
                }
                else if (token === SyntaxKind.ImportKeyword) {
                    token = nextToken();
                    if (token === SyntaxKind.Identifier || isKeyword(token)) {
                        token = nextToken();
                        if (token === SyntaxKind.EqualsToken) {
                            if (tryConsumeRequireCall(/*skipCurrentToken*/ true)) {
                                return true;
                            }
                        }
                    }
                }

                return true;
            }

            return false;
        }

        function tryConsumeRequireCall(skipCurrentToken: boolean): boolean {
            let token = skipCurrentToken ? nextToken() : scanner.getToken();
            if (token === SyntaxKind.RequireKeyword) {
                token = nextToken();
                if (token === SyntaxKind.OpenParenToken) {
                    token = nextToken();
                    if (token === SyntaxKind.StringLiteral) {
                        //  require("mod");
                        recordModuleName();
                    }
                }
                return true;
            }
            return false;
        }

        function tryConsumeDefine(): boolean {
            let token = scanner.getToken();
            if (token === SyntaxKind.Identifier && scanner.getTokenValue() === "define") {
                token = nextToken();
                if (token !== SyntaxKind.OpenParenToken) {
                    return true;
                }

                token = nextToken();
                if (token === SyntaxKind.StringLiteral) {
                    // looks like define ("modname", ... - skip string literal and comma
                    token = nextToken();
                    if (token === SyntaxKind.CommaToken) {
                        token = nextToken();
                    }
                    else {
                        // unexpected token
                        return true;
                    }
                }

                // should be start of dependency list
                if (token !== SyntaxKind.OpenBracketToken) {
                    return true;
                }

                // skip open bracket
                token = nextToken();
                let i = 0;
                // scan until ']' or EOF
                while (token !== SyntaxKind.CloseBracketToken && token !== SyntaxKind.EndOfFileToken) {
                    // record string literals as module names
                    if (token === SyntaxKind.StringLiteral) {
                        recordModuleName();
                        i++;
                    }

                    token = nextToken();
                }
                return true;

            }
            return false;
        }

        function processImports(): void {
            scanner.setText(sourceText);
            nextToken();
            // Look for:
            //    import "mod";
            //    import d from "mod"
            //    import {a as A } from "mod";
            //    import * as NS  from "mod"
            //    import d, {a, b as B} from "mod"
            //    import i = require("mod");
            //
            //    export * from "mod"
            //    export {a as b} from "mod"
            //    export import i = require("mod")
            //    (for JavaScript files) require("mod")

            while (true) {
                if (scanner.getToken() === SyntaxKind.EndOfFileToken) {
                    break;
                }

                // check if at least one of alternative have moved scanner forward
                if (tryConsumeDeclare() ||
                    tryConsumeImport() ||
                    tryConsumeExport() ||
                    (detectJavaScriptImports && (tryConsumeRequireCall(/*skipCurrentToken*/ false) || tryConsumeDefine()))) {
                    continue;
                }
                else {
                    nextToken();
                }
            }

            scanner.setText(undefined);
        }

        if (readImportFiles) {
            processImports();
        }
        processTripleSlashDirectives();
        if (externalModule) {
            // for external modules module all nested ambient modules are augmentations
            if (ambientExternalModules) {
                // move all detected ambient modules to imported files since they need to be resolved
                for (const decl of ambientExternalModules) {
                    importedFiles.push(decl.ref);
                }
            }
            return { referencedFiles, typeReferenceDirectives, importedFiles, isLibFile: isNoDefaultLib, ambientExternalModules: undefined };
        }
        else {
            // for global scripts ambient modules still can have augmentations - look for ambient modules with depth > 0
            let ambientModuleNames: string[];
            if (ambientExternalModules) {
                for (const decl of ambientExternalModules) {
                    if (decl.depth === 0) {
                        if (!ambientModuleNames) {
                            ambientModuleNames = [];
                        }
                        ambientModuleNames.push(decl.ref.fileName);
                    }
                    else {
                        importedFiles.push(decl.ref);
                    }
                }
            }
            return { referencedFiles, typeReferenceDirectives, importedFiles, isLibFile: isNoDefaultLib, ambientExternalModules: ambientModuleNames };
        }
    }
}
