import GameState from "./GameState";
import * as Stream from "stream";
import GameStateTrackerPlugin from "./GameStateTrackerPlugin";
import Timer from "./plugins/Timer";
import CoinDetector from "./plugins/CoinDetector";

/**
 * Follows the initial game state by applying incoming mutators to the game state.
 * Also increments game state times based on the incoming mutators.
 */
export default class GameStateTracker extends Stream.Transform {

	public gameState: GameState;
	public plugins: GameStateTrackerPlugin[];

	constructor(initialGameState?: GameState, opts?: Stream.TransformOptions) {
		opts = opts || {};
		opts.objectMode = true;
		super(opts);
		this.gameState = initialGameState || new GameState(undefined, undefined, undefined, undefined, 0);
		this.plugins = [];
		this.registerPlugin(new Timer());
		this.registerPlugin(new CoinDetector());
	}

	public registerPlugin(plugin: GameStateTrackerPlugin) {
		this.plugins.push(plugin);
	}

	public _transform(mutator: any, encoding: string, callback: Function): void {
		let oldState = this.gameState;
		this.gameState = this.plugins.reduce((state: GameState, plugin: GameStateTrackerPlugin): GameState => {
			return plugin.onBeforeMutate(mutator, state) || state;
		}, oldState);
		this.gameState = this.gameState.apply(mutator);
		this.push(this.gameState);
		this.gameState = this.plugins.reduce((state: GameState, plugin: GameStateTrackerPlugin): GameState => {
			return plugin.onAfterMutate(mutator, this.gameState) || state;
		}, this.gameState);
		this.push(this.gameState);
		callback();
	}
}
