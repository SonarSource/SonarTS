import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";
import Choices from "../../Choices";

export default class SetChoicesMutator implements GameStateMutator {
	constructor(public player: number, public choices: Choices) {
	}

	public applyTo(state: GameState): GameState {
		let choices = state.choices;
		choices = choices.set(+this.player, this.choices);
		return new GameState(
			state.entities,
			state.entityTree,
			state.options,
			state.optionTree,
			state.time,
			choices,
			state.descriptors,
			state.diffs
		);
	}
}
