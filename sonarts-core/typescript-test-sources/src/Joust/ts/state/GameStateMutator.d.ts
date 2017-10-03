import GameState from "./GameState";

interface ApplyTo {
	(state: GameState): GameState;
}

interface GameStateMutator {
	applyTo: ApplyTo;
}

export default GameStateMutator;
