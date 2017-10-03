import GameStateMutator from "./GameStateMutator";
import GameState from "./GameState";

abstract class GameStateTrackerPlugin {

	/**
	 * Called before mutator is applied to the state. The state can be replaced by returning another state.
	 * The mutator is mutable and cannot be replaced.
	 * @param mutator
	 * @param state
	 * @returns {null}
	 */
	public onBeforeMutate(mutator: GameStateMutator, state: GameState): void|GameState {
		return;
	}

	/**
	 * Called after mutator is applied to the state. The state can be replaced by returning another state.
	 * The mutator is mutable and cannot be replaced.
	 * @param mutator
	 * @param state
	 * @returns {null}
	 */
	public onAfterMutate(mutator: GameStateMutator, state: GameState): void|GameState {
		return;
	}
}

export default GameStateTrackerPlugin;
