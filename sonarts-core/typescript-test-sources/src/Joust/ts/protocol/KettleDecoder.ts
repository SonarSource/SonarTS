import * as Stream from "stream";
import Entity from "../Entity";
import AddEntityMutator from "../state/mutators/AddEntityMutator";
import Player from "../Player";
import TagChangeMutator from "../state/mutators/TagChangeMutator";
import Option from "../Option";
import SetOptionsMutator from "../state/mutators/SetOptionsMutator";
import {ChoiceType} from "../enums";
import * as Immutable from "immutable"
import GameStateMutator from "../state/GameStateMutator";

interface KettlePacket {
	Type: string,
	Tags: Object,
	Tag: string,
	Value: string,
	EntityID: string,
	PlayerID: string,
	CardID: string,
	Entities: any[]
}

export default class KettleDecoder extends Stream.Transform {

	private buffer: Immutable.List<number>;
	private ready;
	private draining;

	constructor(opts?: Stream.TransformOptions) {
		opts = opts || {};
		opts.objectMode = true;
		super(opts);
		this.buffer = Immutable.List<number>();
		this.ready = false;
		this.draining = false;
	}

	_write(chunk: number[], encoding: string, callback: Function): void {
		// fill the buffer with any incoming message
		this.buffer = this.buffer.withMutations((list) => {
			for (let i = 0; i < chunk.length; i++) { // this will call buffer.values() and iterate
				let byte = chunk[i];
				list = list.push(byte);
			}
		});
		if (this.ready) {
			this.drainBuffer();
		}
		callback();
	}

	private drainBuffer() {
		if (this.draining) {
			return;
		}
		this.draining = true;
		// attempt to drain the buffer
		while (this.buffer.count() > 0) {
			if (this.buffer.count() < 4) {
				return;
			}
			// parse length
			let lengthBytes = [];
			let temporary = this.buffer;
			for (let i = 0; i < 4; i++) {
				lengthBytes[i] = temporary.first();
				temporary = temporary.shift();
			}
			let length = new Buffer(lengthBytes).readInt32LE(0);
			if (temporary.count() < length) {
				// wait for more data
				return;
			}
			// decode data and shift buffer
			let decoded = new Buffer(temporary.slice(0, length).toArray()).toString('utf-8');
			let packets: any[] = JSON.parse(decoded);
			packets.forEach(this.handlePacket.bind(this));
			this.buffer = temporary.slice(length).toList();
		}
		this.draining = false;
	}

	_read(size: number): void {
		this.ready = true;
		this.drainBuffer();
	}

	private handlePacket(packet: KettlePacket) {
		let type = packet.Type;
		packet = packet[type];
		console.debug(type + ':', packet);
		let mutator: GameStateMutator = null;
		switch (type) {
			case 'GameEntity':
			case 'FullEntity': {
				let tags: { [s: string]: number; } = {};
				Object.keys(packet.Tags).forEach((key) => {
					tags['' + key] = packet.Tags[key];
				});
				let entity = new Entity(
					+packet.EntityID,
					Immutable.Map<number>(tags),
					packet.CardID || null
				);
				mutator = new AddEntityMutator(entity);
				break;
			}
			case 'Player': {
				let tags: { [s: string]: number; } = {};
				Object.keys(packet.Tags).forEach((key) => {
					tags['' + key] = packet.Tags[key];
				});
				let player = new Player(
					+packet.EntityID,
					Immutable.Map<number>(tags),
					+packet.PlayerID || +packet.EntityID, // default to EntityID until Kettle is changed
					'PlayerName'
				);
				mutator = new AddEntityMutator(player);
				break;
			}
			case 'TagChange':
				mutator = new TagChangeMutator(
					+packet.EntityID,
					+packet.Tag,
					+packet.Value
				);
				break;
			case 'Options':
				let options = Immutable.Map<number, Option>();
				options = options.withMutations((map) => {
					(packet as any).forEach((optionObject: any, index: number) => {
						let option = new Option(
							index,
							optionObject.Type,
							optionObject.MainOption ? optionObject.MainOption.ID : null,
							optionObject.MainOption ? optionObject.MainOption.Targets : null
						);
						map = map.set(index, option);
					});
				});
				mutator = new SetOptionsMutator(options);
				break;
			case 'EntityChoices':
				let entities = packet.Entities;
				switch ((packet as any).Type) {
					case ChoiceType.GENERAL:
						console.log('Choose between the following entities:', entities);
						break;
					default:
						console.error("Unknown choice type " + packet.Type);
						break;
				}
				break;
			case 'ActionEnd':
			case 'ActionStart':
				// @todo actions
				break;
			default:
				console.log('Unknown packet type ' + type);
				break;
		}
		if (!this.push(mutator)) {
			this.ready = false;
		}
	}
}
