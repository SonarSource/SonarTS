import * as Stream from "stream";
import {CardData} from "./interfaces";
import Entity from "./Entity";

export default class TexturePreloader extends Stream.Writable {
	protected fired = {};
	protected cardArtQueue: string[] = ['GAME_005'];
	protected images: HTMLImageElement[] = [];
	private working = 0;
	protected assetQueue = ['cardback', 'hero_frame', 'hero_power', 'inhand_mulligan',
							'inhand_minion_neutral', 'inhand_spell_neutral', 'inhand_weapon_neutral',
							'inhand_minion_legendary', 'mana_crystal', 'inplay_minion', 'effect_sleep',
							'hero_power_exhausted', 'hero_armor', 'hero_attack', 'icon_deathrattle', 'icon_inspire',
							'icon_poisonous', 'icon_trigger', 'inplay_minion_frozen', 'inplay_minion_legendary',
							'inplay_minion_taunt', 'inplay_minion_divine_shield', 'inplay_minion_stealth',
							'inplay_weapon', 'inplay_weapon_dome', 'healing', 'damage', 'skull',
							'inplay_hero_frozen', 'inplay_hero_immune', 'inplay_minion_buffed', 'inplay_minion_enraged',
							'inplay_minion_immune', 'inplay_minion_silenced', 'inplay_minion_untargetable'];

	constructor(public cardArt?: (cardId: string) => string, public assets?: (asset: string) => string) {
		super({objectMode: true});
		this.consume();
	}

	_write(chunk: any, encoding: string, callback: Function) {
		let mutator = (chunk as any);

		let id: string = null;

		if(mutator.entity) {
			let entity = mutator.entity as Entity;
			id = entity.cardId;
		}

		id = id || mutator.cardId;

		if(id) {
			this.cardArtQueue.push(id);
			this.consume();
		}

		callback();
	}

	public consume() {
		// maximum number of parallel requests
		if(this.working >= 1024) {
			return;
		}

		if((!this.cardArt || !this.cardArtQueue.length) && (!this.assets || !this.assetQueue.length)) {
			return;
		}

		this.working++;

		let next = () => {
			this.working--;
			this.consume();
		};

		let file = this.assetQueue.shift();
		if (!!this.assets && file) {
			file = this.assets("images/" + file + ".png");
		}
		else {
			let cardId = this.cardArtQueue.shift();
			file = this.cardArt(cardId);
		}

		if (this.fired[file]) {
			next();
			return;
		}

		this.fired[file] = true;

		let image = new Image;
		image.onload = next;
		image.onerror = next;
		image.src = file;
		this.images[this.images.length] = image;

		// attempt next consumption immediately
		this.consume();
	}

	public canPreload(): boolean {
		return !!this.assets || !!this.cardArt;
	}

	public isDone(): boolean {
		return this.cardArtQueue.length + this.assetQueue.length + this.working == 0;
	}
}
