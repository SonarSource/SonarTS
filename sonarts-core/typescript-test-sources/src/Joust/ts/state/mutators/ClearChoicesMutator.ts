import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";

export default class ClearChoicesMutator implements GameStateMutator {
	constructor(public player: number) {

	}

	public applyTo(state: GameState): GameState {
		if (!this.player) {
			console.error("Missing player");
			return state;
		}

		let oldChoices = state.choices;
		let newChoices = state.choices.delete(+this.player);

		if (newChoices === oldChoices) {
			return state;
		}

		return new GameState(
			state.entities,
			state.entityTree,
			state.options,
			state.optionTree.clear(),
			state.time,
			newChoices,
			state.descriptors,
			state.diffs
		);
	}
}
