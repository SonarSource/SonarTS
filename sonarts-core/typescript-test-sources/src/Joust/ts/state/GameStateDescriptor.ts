import * as Immutable from "immutable";
import {BlockType} from "../enums";
import MetaData from "../MetaData";

export default class GameStateDescriptor {

	constructor(private _entityId: number, private _target: number, private _action: BlockType, private _metaData?: Immutable.Set<MetaData>) {
		if(!this._metaData) {
			this._metaData = Immutable.Set<MetaData>();
		}
	}

	get entityId(): number {
		return this._entityId;
	}

	get target(): number {
		return this._target;
	}

	get type(): BlockType {
		return this._action;
	}

	get metaData(): Immutable.Set<MetaData> {
		return this._metaData;
	}
}
