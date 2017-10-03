import * as Stream from "stream";
import {InteractiveBackend} from "../interfaces";
import Option from "../Option";
import Entity from "../Entity";
import ClearOptionsMutator from "../state/mutators/ClearOptionsMutator";
import GameStateTracker from "../state/GameStateTracker";

export default class KettleEncoder extends Stream.Readable implements InteractiveBackend {

	private tracker: GameStateTracker;
	private gameStarted: boolean;

	constructor(tracker?: GameStateTracker, opts?: Stream.ReadableOptions) {
		opts = opts || {};
		opts.objectMode = true;
		super(opts);
		this.gameStarted = false;
		this.tracker = tracker;
	}

	public startGame(): void {
		let repeat = (array: any[], times: number): any[] => {
			let result = array;
			for (let i = 0; i < times; i++) {
				result = result.concat(array);
			}
			return result;
		};

		this.queueMessage([{
			Type: 'CreateGame',
			CreateGame: {
				Players: [
					{
						Name: 'Player 1',
						Hero: 'HERO_08',
						Cards: repeat(['GVG_003'], 30),
					},
					{
						Name: 'Player 2',
						Hero: 'HERO_08',
						Cards: repeat(['GVG_003'], 30),
					}
				]
			}
		}]);
	}

	public exitGame(): void {
		this.push(null);
	}

	public sendOption(option: Option, target?: number, position?: number): void {
		if (this.tracker) {
			this.tracker.write(new ClearOptionsMutator());
		}
		let sendOption: any = null;
		target = target || null;
		switch (option.type) {
			case 2: // end turn
				sendOption = { Index: option.index };
				break;
			case 3: // power
				sendOption = {
					Index: option.index,
					Target: target
				};
				if (typeof position === "number") {
					sendOption.Position = position;
				}
				console.log(sendOption);
				break;
		}
		this.queueMessage({
			Type: 'SendOption',
			SendOption: sendOption
		});
	}

	public chooseEntities(entities: Entity[]): void {
		let ids = entities.map((entity: Entity) => {
			return entity.id;
		});
		this.queueMessage({
			Type: 'ChooseEntities',
			ChooseEntities: ids
		})
	}

	_read(size: number): void {
		return;
	}

	protected queueMessage(payload) {
		let message = JSON.stringify(payload);
		let length = message.length;
		// todo: we need to properly encode the length (see onData)
		let buffer = new Buffer(((number: number, length: number) => {
			return Array(length - (number + '').length + 1).join('0') + number;
		})(length, 4) + message, 'utf-8');

		this.push(buffer.toString('utf-8'));
	}
}
