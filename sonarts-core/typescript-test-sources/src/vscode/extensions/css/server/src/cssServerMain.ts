/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {
	createConnection, IConnection, Range,
	TextDocuments, TextDocument, InitializeParams, InitializeResult, RequestType
} from 'vscode-languageserver';

import { getCSSLanguageService, getSCSSLanguageService, getLESSLanguageService, LanguageSettings, LanguageService, Stylesheet } from 'vscode-css-languageservice';
import { getLanguageModelCache } from './languageModelCache';

namespace ColorSymbolRequest {
	export const type: RequestType<string, Range[], any, any> = new RequestType('css/colorSymbols');
}

export interface Settings {
	css: LanguageSettings;
	less: LanguageSettings;
	scss: LanguageSettings;
}

// Create a connection for the server.
let connection: IConnection = createConnection();

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

let stylesheets = getLanguageModelCache<Stylesheet>(10, 60, document => getLanguageService(document).parseStylesheet(document));
documents.onDidClose(e => {
	stylesheets.onDocumentRemoved(e.document);
});
connection.onShutdown(() => {
	stylesheets.dispose();
});

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
connection.onInitialize((params: InitializeParams): InitializeResult => {
	let snippetSupport = params.capabilities && params.capabilities.textDocument && params.capabilities.textDocument.completion && params.capabilities.textDocument.completion.completionItem && params.capabilities.textDocument.completion.completionItem.snippetSupport;
	return {
		capabilities: {
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: documents.syncKind,
			completionProvider: snippetSupport ? { resolveProvider: false } : null,
			hoverProvider: true,
			documentSymbolProvider: true,
			referencesProvider: true,
			definitionProvider: true,
			documentHighlightProvider: true,
			codeActionProvider: true,
			renameProvider: true
		}
	};
});

let languageServices: { [id: string]: LanguageService } = {
	css: getCSSLanguageService(),
	scss: getSCSSLanguageService(),
	less: getLESSLanguageService()
};

function getLanguageService(document: TextDocument) {
	let service = languageServices[document.languageId];
	if (!service) {
		connection.console.log('Document type is ' + document.languageId + ', using css instead.');
		service = languageServices['css'];
	}
	return service;
}

// The settings have changed. Is send on server activation as well.
connection.onDidChangeConfiguration(change => {
	updateConfiguration(<Settings>change.settings);
});

function updateConfiguration(settings: Settings) {
	for (let languageId in languageServices) {
		languageServices[languageId].configure(settings[languageId]);
	}
	// Revalidate any open text documents
	documents.all().forEach(triggerValidation);
}

let pendingValidationRequests: { [uri: string]: NodeJS.Timer } = {};
const validationDelayMs = 200;

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	triggerValidation(change.document);
});

// a document has closed: clear all diagnostics
documents.onDidClose(event => {
	cleanPendingValidation(event.document);
	connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

function cleanPendingValidation(textDocument: TextDocument): void {
	let request = pendingValidationRequests[textDocument.uri];
	if (request) {
		clearTimeout(request);
		delete pendingValidationRequests[textDocument.uri];
	}
}

function triggerValidation(textDocument: TextDocument): void {
	cleanPendingValidation(textDocument);
	pendingValidationRequests[textDocument.uri] = setTimeout(() => {
		delete pendingValidationRequests[textDocument.uri];
		validateTextDocument(textDocument);
	}, validationDelayMs);
}

function validateTextDocument(textDocument: TextDocument): void {
	let stylesheet = stylesheets.get(textDocument);
	let diagnostics = getLanguageService(textDocument).doValidation(textDocument, stylesheet);
	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onCompletion(textDocumentPosition => {
	let document = documents.get(textDocumentPosition.textDocument.uri);
	let stylesheet = stylesheets.get(document);
	return getLanguageService(document).doComplete(document, textDocumentPosition.position, stylesheet);
});

connection.onHover(textDocumentPosition => {
	let document = documents.get(textDocumentPosition.textDocument.uri);
	let styleSheet = stylesheets.get(document);
	return getLanguageService(document).doHover(document, textDocumentPosition.position, styleSheet);
});

connection.onDocumentSymbol(documentSymbolParams => {
	let document = documents.get(documentSymbolParams.textDocument.uri);
	let stylesheet = stylesheets.get(document);
	return getLanguageService(document).findDocumentSymbols(document, stylesheet);
});

connection.onDefinition(documentSymbolParams => {
	let document = documents.get(documentSymbolParams.textDocument.uri);
	let stylesheet = stylesheets.get(document);
	return getLanguageService(document).findDefinition(document, documentSymbolParams.position, stylesheet);
});

connection.onDocumentHighlight(documentSymbolParams => {
	let document = documents.get(documentSymbolParams.textDocument.uri);
	let stylesheet = stylesheets.get(document);
	return getLanguageService(document).findDocumentHighlights(document, documentSymbolParams.position, stylesheet);
});

connection.onReferences(referenceParams => {
	let document = documents.get(referenceParams.textDocument.uri);
	let stylesheet = stylesheets.get(document);
	return getLanguageService(document).findReferences(document, referenceParams.position, stylesheet);
});

connection.onCodeAction(codeActionParams => {
	let document = documents.get(codeActionParams.textDocument.uri);
	let stylesheet = stylesheets.get(document);
	return getLanguageService(document).doCodeActions(document, codeActionParams.range, codeActionParams.context, stylesheet);
});

connection.onRequest(ColorSymbolRequest.type, uri => {
	let document = documents.get(uri);
	if (document) {
		let stylesheet = stylesheets.get(document);
		return getLanguageService(document).findColorSymbols(document, stylesheet);
	}
	return [];
});

connection.onRenameRequest(renameParameters => {
	let document = documents.get(renameParameters.textDocument.uri);
	let stylesheet = stylesheets.get(document);
	return getLanguageService(document).doRename(document, renameParameters.position, renameParameters.newName, stylesheet);
});

// Listen on the connection
connection.listen();