import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";

export default class ClearOptionsMutator implements GameStateMutator {
	public applyTo(state: GameState): GameState {
		if (state.options.isEmpty()) {
			return state;
		}

		return new GameState(
			state.entities,
			state.entityTree,
			state.options.clear(),
			state.optionTree.clear(),
			state.time,
			state.choices,
			state.descriptors,
			state.diffs
		);
	}
}
