import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";
import PopDescriptorMutator from "../mutators/PopDescriptorMutator";
import {BlockType, GameTag, Step, MetaDataType} from "../../enums";
import IncrementTimeMutator from "../mutators/IncrementTimeMutator";
import PushDescriptorMutator from "../mutators/PushDescriptorMutator";
import EnrichDescriptorMutator from "../mutators/EnrichDescriptorMutator";
import TagChangeMutator from "../mutators/TagChangeMutator";
import SetOptionsMutator from "../mutators/SetOptionsMutator";
import SetChoicesMutator from "../mutators/SetChoicesMutator";
import GameStateTrackerPlugin from "../GameStateTrackerPlugin";
import * as _ from "lodash";

/**
 * Increments the game state time based on the mutator and the game state itself.
 */
export default class Timer extends GameStateTrackerPlugin {

	private lastDescriptorType: BlockType = null;
	private waitAtNextBlockOrEndOfBlock: boolean = false;
	private mulliganChoicesSeen: number = 0;
	private lastDescriptorEntityId: number = null;
	private upcomingMetadataTargets: number[] = [];
	private hasSteppedThisBlock: boolean = false;

	public onBeforeMutate(mutator: GameStateMutator, state: GameState): void|GameState {
		let timeStep = 0;

		if (mutator instanceof PopDescriptorMutator) {
			if (this.lastDescriptorType === BlockType.RITUAL) {
				timeStep = 2;
			}
		}

		if (timeStep) {
			return state.apply(new IncrementTimeMutator(timeStep));
		}

		return;
	}

	public onAfterMutate(mutator: GameStateMutator, state: GameState): void|GameState {
		let timeStep = 0;
		let gameStep = state.game ? state.game.getTag(GameTag.STEP) : Step.INVALID;

		// main action timing
		if (this.waitAtNextBlockOrEndOfBlock && (mutator instanceof PopDescriptorMutator || mutator instanceof PushDescriptorMutator)) {
			timeStep = 2;
			this.waitAtNextBlockOrEndOfBlock = false;
		}

		if (mutator instanceof PushDescriptorMutator) {
			this.lastDescriptorEntityId = mutator.descriptor.entityId;
			this.lastDescriptorType = mutator.descriptor.type;
			switch (mutator.descriptor.type) {
				case BlockType.PLAY:
					this.waitAtNextBlockOrEndOfBlock = true;
					break;
				case BlockType.RITUAL:
					timeStep = 2;
					break;
				case BlockType.TRIGGER:
					if (!timeStep) {
						if (mutator.descriptor.entityId > 3 && gameStep !== Step.INVALID) {
							let entity = state.getEntity(mutator.descriptor.entityId);
							if (entity && entity.cardId === "KAR_096" && entity.getTag(GameTag.REVEALED)) {
								// Prince Malchezaar after Mulligan
								timeStep = 3;
							}
							else {
								// normal entity triggers
								timeStep = 1;
							}
						}
						else {
							switch (gameStep) {
								case Step.MAIN_START:
									// before card is drawn
									timeStep = 1;
									break;
								case Step.MAIN_ACTION:
									// after card is drawn
									timeStep = 1.5;
									break;
								default:
									break;
							}
						}
					}
					break;
				case BlockType.ATTACK:
					// before attack hits
					timeStep = 1;
					break;
				case BlockType.POWER:
					if (!timeStep) {
						timeStep = 1;
					}
					break;
				default:
					if (!timeStep) {
						timeStep = 1.5;
					}
					break;
			}
		}

		if (mutator instanceof PopDescriptorMutator) {
			if (!timeStep) {
				if (this.lastDescriptorEntityId > 3 && gameStep !== Step.INVALID) {
					if (this.lastDescriptorType === BlockType.TRIGGER) {
						timeStep = 1;
					}
					else if (this.lastDescriptorType === BlockType.PLAY) {
						// pause after playing a card
						if (!state.descriptor) {
							// ...if not in another block (Yogg-Sarron)
							timeStep = 1;
						}
					}
					else if (!this.hasSteppedThisBlock) {
						timeStep = 2;
						this.hasSteppedThisBlock = true;
					}
				}
			}
			if (this.upcomingMetadataTargets.length) {
				this.upcomingMetadataTargets = [];
			}
			this.lastDescriptorType = state.descriptor ? state.descriptor.type : null;
		}

		// damage hits/healing
		if (mutator instanceof EnrichDescriptorMutator) {
			let targets = mutator.metaData.entities.toArray();
			if (this.lastDescriptorType !== BlockType.ATTACK) {
				// attack pauses are handled in diffs
				if (mutator.metaData.type === MetaDataType.TARGET) {
					this.upcomingMetadataTargets = _.merge(this.upcomingMetadataTargets, targets);
				}
				if (mutator.metaData.type === MetaDataType.DAMAGE || mutator.metaData.type === MetaDataType.HEALING) {
					this.upcomingMetadataTargets = _.difference<number>(this.upcomingMetadataTargets, targets);
					if (!this.upcomingMetadataTargets.length) {
						// once all targets have received their damage value, we step
						this.hasSteppedThisBlock = true;
						timeStep = targets.length > 1 ? 2 : 1;
					}
				}
			}
		}

		// attack and stuff
		if (mutator instanceof TagChangeMutator) {
			if (this.lastDescriptorType === BlockType.ATTACK) {
				if (mutator.tag === GameTag.PROPOSED_DEFENDER && mutator.value === 0) {
					timeStep = 1;
				}
			}
		}

		// step when playable options are available
		if (mutator instanceof SetOptionsMutator) {
			timeStep = 0;
		}

		// step when choices are set
		if (mutator instanceof SetChoicesMutator) {
			if (gameStep === Step.BEGIN_MULLIGAN) {
				this.mulliganChoicesSeen++;
				if (this.mulliganChoicesSeen >= 2) {
					// mulligan step
					timeStep = 6;
				}
			}
			else {
				// discover step
				timeStep = 4;
			}
		}

		if (timeStep) {
			return state.apply(new IncrementTimeMutator(timeStep));
		}
	}
}
