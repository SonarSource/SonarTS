import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";
import Entity from "../../Entity";

export default class ReplaceEntityMutator implements GameStateMutator {
	constructor(public entity: Entity) {
	}

	public applyTo(state: GameState): GameState {
		let newEntity = this.entity;
		if (!newEntity) {
			console.error("Cannot replace null entity");
			return state;
		}

		let id = this.entity.id;
		let oldEntity = state.getEntity(id);
		if (!oldEntity) {
			console.error("Cannot update non-existent entity #" + id);
			return state;
		}

		// verify entity has actually changed
		if (newEntity === oldEntity) {
			console.warn("Update has no effect on entity #" + id);
			return state;
		}

		let entities = state.entities;
		entities = entities.set(id, newEntity);

		let entityTree = state.entityTree;
		entityTree = entityTree.withMutations((map) => {
			map.deleteIn([oldEntity.getController(), oldEntity.getZone(), id])
				.setIn([newEntity.getController(), newEntity.getZone(), id], newEntity);
		});

		return new GameState(
			entities,
			entityTree,
			state.options,
			state.optionTree,
			state.time,
			state.choices,
			state.descriptors,
			state.diffs
		);
	}
}
