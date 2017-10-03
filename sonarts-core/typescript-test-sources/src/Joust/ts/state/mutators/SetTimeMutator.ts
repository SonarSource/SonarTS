import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";

export default class SetTimeMutator implements GameStateMutator {
	constructor(public time: number) {
	}

	public applyTo(state: GameState): GameState {
		return new GameState(state.entities, state.entityTree, state.options, state.optionTree, this.time, state.choices, state.descriptors, state.diffs);
	}
}
