import * as Immutable from "immutable";
import {MetaDataType} from "./enums";

export default class MetaData {
	constructor(private _type: MetaDataType, private _data: number, private _entities?: Immutable.Set<number>) {
		if (!this._entities) {
			this._entities = Immutable.Set<number>();
		}
	}

	get type(): MetaDataType {
		return this._type;
	}

	get data(): number {
		return this._data;
	}

	get entities(): Immutable.Set<number> {
		return this._entities;
	}
}
