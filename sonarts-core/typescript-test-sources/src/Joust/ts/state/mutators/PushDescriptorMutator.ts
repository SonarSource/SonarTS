import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";
import GameStateDescriptor from "../GameStateDescriptor";

export default class PushDescriptorMutator implements GameStateMutator {
	constructor(public descriptor: GameStateDescriptor) {
	}

	public applyTo(state: GameState): GameState {
		let descriptors = state.descriptors.push(this.descriptor);
		return new GameState(
			state.entities,
			state.entityTree,
			state.options,
			state.optionTree,
			state.time,
			state.choices,
			descriptors,
			state.diffs
		);
	}
}
