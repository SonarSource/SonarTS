import {GameTag} from "../../enums";
import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";
import ReplaceEntityMutator from "./ReplaceEntityMutator";

export default class HideEntityMutator implements GameStateMutator {
	public id: number;
	public zone: number;

	constructor(id: number, zone: number) {
		this.id = +id;
		this.zone = +zone;
	}

	public applyTo(state: GameState): GameState {
		let oldEntity = state.getEntity(this.id);
		if (!oldEntity) {
			console.error("Cannot hide non-existent entity #" + this.id);
			return state;
		}

		// reset various tags
		let tags = oldEntity.getTags();
		tags = tags.set("" + GameTag.ZONE, this.zone);
		let newEntity = oldEntity.replaceTags(tags).setCardId(null);

		return state.apply(new ReplaceEntityMutator(newEntity));
	}
}
