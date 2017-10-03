import Entity from "../Entity";
import Option from "../Option";
import GameStateMutator from "./GameStateMutator";
import * as Immutable from "immutable";
import Choices from "../Choices";
import Player from "../Player";
import {CardType} from "../enums";
import GameStateDescriptor from "./GameStateDescriptor";
import {GameStateDiff} from "../interfaces";

/**
 * Fully describes a single game constellation ("snapshot")
 */
export default class GameState {

	constructor(protected _entities?: Immutable.Map<number, Entity>,
		protected _entityTree?: Immutable.Map<number, Immutable.Map<number, Immutable.Map<number, Entity>>>,
		protected _options?: Immutable.Map<number, Option>,
		protected _optionTree?: Immutable.Map<number, Immutable.Map<number, Immutable.Map<number, Option>>>,
		protected _time?: number,
		protected _choices?: Immutable.Map<number, Choices>,
		protected _descriptors?: Immutable.Stack<GameStateDescriptor>,
		protected _diffs?: Immutable.Set<GameStateDiff>) {
		if (!this._entities) {
			this._entities = Immutable.Map<number, Entity>();
		}
		if (!this._entityTree) {
			this._entityTree = Immutable.Map<number, Immutable.Map<number, Immutable.Map<number, Entity>>>();
		}
		if (!this._options) {
			this._options = Immutable.Map<number, Option>();
		}
		if (!this._optionTree) {
			this._optionTree = Immutable.Map<number, Immutable.Map<number, Immutable.Map<number, Option>>>();
		}
		if (typeof (this._time) === "undefined") {
			this._time = null;
		}
		if (!this._choices) {
			this._choices = Immutable.Map<number, Choices>();
		}
		if (typeof (this._descriptors) === "undefined") {
			this._descriptors = Immutable.Stack<GameStateDescriptor>();
		}
		if (!this._diffs) {
			this._diffs = Immutable.Set<GameStateDiff>();
		}
	}

	public getEntity(id: number): Entity {
		return this.entities.get(id);
	}

	get entities(): Immutable.Map<number, Entity> {
		return this._entities;
	}

	get entityTree(): Immutable.Map<number, Immutable.Map<number, Immutable.Map<number, Entity>>> {
		return this._entityTree;
	}

	get game():Entity {
		return this.entities.get(1);
	}

	public getPlayer(playerId: number): Player {
		return this.entities.filter((entity: Entity):boolean => {
			return !!entity && entity.getCardType() === CardType.PLAYER && (entity as Player).playerId === playerId;
		}).first() as Player;
	}

	public getPlayers(): Player[] {
		return this.entities.filter((entity: Entity):boolean => {
			return !!entity && entity.getCardType() === CardType.PLAYER;
		}).toArray() as Player[];
	}

	public getPlayerCount(): number {
		return this._entityTree.count() - (+this._entityTree.has(0));
	}

	get options(): Immutable.Map<number, Option> {
		return this._options;
	}

	get optionTree(): Immutable.Map<number, Immutable.Map<number, Immutable.Map<number, Option>>> {
		return this._optionTree;
	}

	get time(): number {
		return this._time;
	}

	get choices(): Immutable.Map<number, Choices> {
		return this._choices;
	}

	get descriptor(): GameStateDescriptor {
		return this.descriptors.peek();
	}

	get descriptors(): Immutable.Stack<GameStateDescriptor> {
		return this._descriptors;
	}

	get diffs(): Immutable.Set<GameStateDiff> {
		return this._diffs;
	}

	public apply(mutator: GameStateMutator): GameState {
		return mutator.applyTo(this);
	}
}
