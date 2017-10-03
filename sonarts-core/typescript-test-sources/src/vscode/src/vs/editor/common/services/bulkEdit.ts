/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as nls from 'vs/nls';
import { flatten } from 'vs/base/common/arrays';
import { IStringDictionary, forEach, values, groupBy, size } from 'vs/base/common/collections';
import { IDisposable, dispose, IReference } from 'vs/base/common/lifecycle';
import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { ITextModelResolverService, ITextEditorModel } from 'vs/editor/common/services/resolverService';
import { IFileService, IFileChange } from 'vs/platform/files/common/files';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Range, IRange } from 'vs/editor/common/core/range';
import { Selection, ISelection } from 'vs/editor/common/core/selection';
import { IIdentifiedSingleEditOperation, IModel, EndOfLineSequence, ICommonCodeEditor } from 'vs/editor/common/editorCommon';
import { IProgressRunner } from 'vs/platform/progress/common/progress';

export interface IResourceEdit {
	resource: URI;
	range?: IRange;
	newText: string;
	newEol?: EndOfLineSequence;
}

interface IRecording {
	stop(): void;
	hasChanged(resource: URI): boolean;
	allChanges(): IFileChange[];
}

class ChangeRecorder {

	private _fileService: IFileService;

	constructor(fileService?: IFileService) {
		this._fileService = fileService;
	}

	public start(): IRecording {

		const changes: IStringDictionary<IFileChange[]> = Object.create(null);

		let stop: IDisposable;
		if (this._fileService) {
			stop = this._fileService.onFileChanges((event) => {
				event.changes.forEach(change => {

					const key = String(change.resource);
					let array = changes[key];

					if (!array) {
						changes[key] = array = [];
					}

					array.push(change);
				});
			});
		}

		return {
			stop: () => { return stop && stop.dispose(); },
			hasChanged: (resource: URI) => !!changes[resource.toString()],
			allChanges: () => flatten(values(changes))
		};
	}
}

class EditTask implements IDisposable {

	private _initialSelections: Selection[];
	private _endCursorSelection: Selection;
	private get _model(): IModel { return this._modelReference.object.textEditorModel; }
	private _modelReference: IReference<ITextEditorModel>;
	private _edits: IIdentifiedSingleEditOperation[];
	private _newEol: EndOfLineSequence;

	constructor(modelReference: IReference<ITextEditorModel>) {
		this._endCursorSelection = null;
		this._modelReference = modelReference;
		this._edits = [];
	}

	public addEdit(edit: IResourceEdit): void {

		if (typeof edit.newEol === 'number') {
			// honor eol-change
			this._newEol = edit.newEol;
		}

		if (edit.range || edit.newText) {
			// create edit operation
			let range: Range;
			if (!edit.range) {
				range = this._model.getFullModelRange();
			} else {
				range = Range.lift(edit.range);
			}
			this._edits.push(EditOperation.replaceMove(range, edit.newText));
		}
	}

	public apply(): void {
		if (this._edits.length > 0) {

			this._edits = this._edits.map((value, index) => ({ value, index })).sort((a, b) => {
				let ret = Range.compareRangesUsingStarts(a.value.range, b.value.range);
				if (ret === 0) {
					ret = a.index - b.index;
				}
				return ret;
			}).map(element => element.value);

			this._initialSelections = this._getInitialSelections();
			this._model.pushEditOperations(this._initialSelections, this._edits, (edits) => this._getEndCursorSelections(edits));
		}
		if (this._newEol !== undefined) {
			this._model.setEOL(this._newEol);
		}
	}

	protected _getInitialSelections(): Selection[] {
		const firstRange = this._edits[0].range;
		const initialSelection = new Selection(
			firstRange.startLineNumber,
			firstRange.startColumn,
			firstRange.endLineNumber,
			firstRange.endColumn
		);
		return [initialSelection];
	}

	private _getEndCursorSelections(inverseEditOperations: IIdentifiedSingleEditOperation[]): Selection[] {
		let relevantEditIndex = 0;
		for (let i = 0; i < inverseEditOperations.length; i++) {
			const editRange = inverseEditOperations[i].range;
			for (let j = 0; j < this._initialSelections.length; j++) {
				const selectionRange = this._initialSelections[j];
				if (Range.areIntersectingOrTouching(editRange, selectionRange)) {
					relevantEditIndex = i;
					break;
				}
			}
		}

		const srcRange = inverseEditOperations[relevantEditIndex].range;
		this._endCursorSelection = new Selection(
			srcRange.endLineNumber,
			srcRange.endColumn,
			srcRange.endLineNumber,
			srcRange.endColumn
		);
		return [this._endCursorSelection];
	}

	public getEndCursorSelection(): Selection {
		return this._endCursorSelection;
	}

	dispose() {
		if (this._model) {
			this._modelReference.dispose();
			this._modelReference = null;
		}
	}
}

class SourceModelEditTask extends EditTask {

	private _knownInitialSelections: Selection[];

	constructor(modelReference: IReference<ITextEditorModel>, initialSelections: Selection[]) {
		super(modelReference);
		this._knownInitialSelections = initialSelections;
	}

	protected _getInitialSelections(): Selection[] {
		return this._knownInitialSelections;
	}
}

class BulkEditModel implements IDisposable {

	private _textModelResolverService: ITextModelResolverService;
	private _numberOfResourcesToModify: number = 0;
	private _numberOfChanges: number = 0;
	private _edits: IStringDictionary<IResourceEdit[]> = Object.create(null);
	private _tasks: EditTask[];
	private _sourceModel: URI;
	private _sourceSelections: Selection[];
	private _sourceModelTask: SourceModelEditTask;

	constructor(textModelResolverService: ITextModelResolverService, sourceModel: URI, sourceSelections: Selection[], edits: IResourceEdit[], private progress: IProgressRunner = null) {
		this._textModelResolverService = textModelResolverService;
		this._sourceModel = sourceModel;
		this._sourceSelections = sourceSelections;
		this._sourceModelTask = null;

		for (let edit of edits) {
			this._addEdit(edit);
		}
	}

	public resourcesCount(): number {
		return this._numberOfResourcesToModify;
	}

	public changeCount(): number {
		return this._numberOfChanges;
	}

	private _addEdit(edit: IResourceEdit): void {
		let array = this._edits[edit.resource.toString()];
		if (!array) {
			this._edits[edit.resource.toString()] = array = [];
			this._numberOfResourcesToModify += 1;
		}
		this._numberOfChanges += 1;
		array.push(edit);
	}

	public prepare(): TPromise<BulkEditModel> {

		if (this._tasks) {
			throw new Error('illegal state - already prepared');
		}

		this._tasks = [];
		const promises: TPromise<any>[] = [];

		if (this.progress) {
			this.progress.total(this._numberOfResourcesToModify * 2);
		}

		forEach(this._edits, entry => {
			const promise = this._textModelResolverService.createModelReference(URI.parse(entry.key)).then(ref => {
				const model = ref.object;

				if (!model || !model.textEditorModel) {
					throw new Error(`Cannot load file ${entry.key}`);
				}

				const textEditorModel = model.textEditorModel;
				let task: EditTask;

				if (this._sourceModel && textEditorModel.uri.toString() === this._sourceModel.toString()) {
					this._sourceModelTask = new SourceModelEditTask(ref, this._sourceSelections);
					task = this._sourceModelTask;
				} else {
					task = new EditTask(ref);
				}

				entry.value.forEach(edit => task.addEdit(edit));
				this._tasks.push(task);
				if (this.progress) {
					this.progress.worked(1);
				}
			});
			promises.push(promise);
		});


		return TPromise.join(promises).then(_ => this);
	}

	public apply(): Selection {
		this._tasks.forEach(task => this.applyTask(task));
		let r: Selection = null;
		if (this._sourceModelTask) {
			r = this._sourceModelTask.getEndCursorSelection();
		}
		return r;
	}

	private applyTask(task): void {
		task.apply();
		if (this.progress) {
			this.progress.worked(1);
		}
	}

	dispose(): void {
		this._tasks = dispose(this._tasks);
	}
}

export interface BulkEdit {
	progress(progress: IProgressRunner);
	add(edit: IResourceEdit[]): void;
	finish(): TPromise<ISelection>;
	ariaMessage(): string;
}

export function bulkEdit(textModelResolverService: ITextModelResolverService, editor: ICommonCodeEditor, edits: IResourceEdit[], fileService?: IFileService, progress: IProgressRunner = null): TPromise<any> {
	let bulk = createBulkEdit(textModelResolverService, editor, fileService);
	bulk.add(edits);
	bulk.progress(progress);
	return bulk.finish();
}

export function createBulkEdit(textModelResolverService: ITextModelResolverService, editor?: ICommonCodeEditor, fileService?: IFileService): BulkEdit {

	let all: IResourceEdit[] = [];
	let recording = new ChangeRecorder(fileService).start();
	let progressRunner: IProgressRunner;

	function progress(progress: IProgressRunner) {
		progressRunner = progress;
	}

	function add(edits: IResourceEdit[]): void {
		all.push(...edits);
	}

	function getConcurrentEdits() {
		let names: string[];
		for (let edit of all) {
			if (recording.hasChanged(edit.resource)) {
				if (!names) {
					names = [];
				}
				names.push(edit.resource.fsPath);
			}
		}
		if (names) {
			return nls.localize('conflict', "These files have changed in the meantime: {0}", names.join(', '));
		}
		return undefined;
	}

	function finish(): TPromise<ISelection> {

		if (all.length === 0) {
			return TPromise.as(undefined);
		}

		let concurrentEdits = getConcurrentEdits();
		if (concurrentEdits) {
			return TPromise.wrapError<ISelection>(concurrentEdits);
		}

		let uri: URI;
		let selections: Selection[];

		if (editor && editor.getModel()) {
			uri = editor.getModel().uri;
			selections = editor.getSelections();
		}

		const model = new BulkEditModel(textModelResolverService, uri, selections, all, progressRunner);

		return model.prepare().then(_ => {

			let concurrentEdits = getConcurrentEdits();
			if (concurrentEdits) {
				throw new Error(concurrentEdits);
			}

			recording.stop();

			const result = model.apply();
			model.dispose();
			return result;
		});
	}

	function ariaMessage(): string {
		let editCount = all.length;
		let resourceCount = size(groupBy(all, edit => edit.resource.toString()));
		if (editCount === 0) {
			return nls.localize('summary.0', "Made no edits");
		} else if (editCount > 1 && resourceCount > 1) {
			return nls.localize('summary.nm', "Made {0} text edits in {1} files", editCount, resourceCount);
		} else {
			return nls.localize('summary.n0', "Made {0} text edits in one file", editCount, resourceCount);
		}
	}

	return {
		progress,
		add,
		finish,
		ariaMessage
	};
}
