import GameStateTrackerPlugin from "../GameStateTrackerPlugin";
import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";
import AddEntityMutator from "../mutators/AddEntityMutator";
import Entity from "../../Entity";
import {GameTag, Zone, Mulligan, Step} from "../../enums";

/**
 * Attempts to detect The Coin at the start of the game and sets it's card id if found.
 */
export default class CoinDetector extends GameStateTrackerPlugin {

	public onBeforeMutate(mutator: GameStateMutator, state: GameState): void|GameState {
		if (mutator instanceof AddEntityMutator) {
			const entity = mutator.entity;
			if (this.isCoin(entity, state)) {
				const coin = entity.setCardId("GAME_005");
				mutator.entity = coin;
			}
		}

		return;
	}

	private isCoin(potentialCoin: Entity, state: GameState): boolean {
		let controller = null;
		return (
			!potentialCoin.cardId &&
			potentialCoin.getTag(GameTag.ZONE) === Zone.HAND &&
			potentialCoin.getTag(GameTag.ZONE_POSITION) === 5 &&
			state.game.getTag(GameTag.MULLIGAN_STATE) === Mulligan.INVALID &&
			state.game.getTag(GameTag.STEP) === Step.INVALID &&
			(controller = state.getPlayer(potentialCoin.getTag(GameTag.CONTROLLER))) &&
			!controller.getTag(GameTag.FIRST_PLAYER)
		);
	}
}
