import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";
import * as Immutable from "immutable";
import ReplaceEntityMutator from "./ReplaceEntityMutator";
import AddDiffsMutator from "./AddDiffsMutator";
import {GameStateDiff} from "../../interfaces";

export default class ShowEntityMutator implements GameStateMutator {

	constructor(public entityId: number, public cardId: string, public tags: Immutable.Map<string, number>, public replaceTags: boolean = false) {
	}

	public applyTo(state: GameState): GameState {
		const id = +this.entityId;
		const oldEntity = state.getEntity(id);

		if (!oldEntity) {
			console.error("Cannot show non-existent entity #" + id);
			return state;
		}

		let newEntity = oldEntity.setCardId(this.cardId);

		if (this.replaceTags) {
			newEntity = newEntity.setTags(Immutable.Map<string, number>());
		}

		newEntity = newEntity.setTags(this.tags);

		let diffs: GameStateDiff[] = [];
		this.tags.forEach((value: number, tag: string) => {
			diffs.push({
				entity: id,
				tag: +tag,
				previous: this.replaceTags ? null : (oldEntity.getTags().has(tag) ? oldEntity.getTag(+tag) : null),
				current: value,
			});
		});

		return state
			.apply(new ReplaceEntityMutator(newEntity))
			.apply(new AddDiffsMutator(diffs));
	}
}
