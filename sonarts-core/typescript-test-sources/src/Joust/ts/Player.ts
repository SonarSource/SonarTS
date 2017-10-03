import Entity from "./Entity";
import {GameTag, PlayState} from "./enums";
import * as Immutable from "immutable";

export default class Player extends Entity {
	protected _name: string;
	protected _playerId: number;
	protected _rank: number;
	protected _legendRank: number;
	protected _conceded: boolean;

	constructor(id: number, tags: Immutable.Map<string, number>, playerId: number, name: string, rank?: number, legendRank?: number, conceded?: boolean) {
		super(id, tags);
		this._playerId = playerId;
		this._name = name;
		this._rank = rank;
		this._legendRank = legendRank;
		this._conceded = conceded;
	}

	get playerId(): number {
		return this._playerId;
	}

	get name(): string {
		return this._name;
	}

	get rank(): number {
		return this._rank;
	}

	get legendRank(): number {
		return this._legendRank;
	}

	get conceded(): boolean {
		return this._conceded;
	}

	public toString(): string {
		return "Player #" + this.id + " (playerId: " + this.playerId + ", name: \"" + this.name + "\")";
	}

	protected factory(tags: Immutable.Map<string, number>, cardId: string): Player {
		if (this.getTag(GameTag.PLAYSTATE) === PlayState.CONCEDED) {
			this._conceded = true;
		}
		return new Player(this.id, tags, this.playerId, this.name, this.rank, this.legendRank, this.conceded);
	}
}
