import * as React from "react";
import {CardType, GameTag} from "../../../enums";
import CardArt from "./CardArt";
import {EntityProps, CardData} from "../../../interfaces";

export default class InPlayCardArt extends React.Component<EntityProps, void> {

	shouldComponentUpdate(nextProps:EntityProps):boolean {
		return (
			nextProps.entity !== this.props.entity ||
			nextProps.damage !== this.props.damage ||
			nextProps.healing !== this.props.healing ||
			nextProps.controller !== this.props.controller ||
			nextProps.assetDirectory !== this.props.assetDirectory ||
			nextProps.cardArtDirectory !== this.props.cardArtDirectory ||
			nextProps.buffed !== this.props.buffed
		);
	}

	public render(): JSX.Element {
		let images = [];
		let entity = this.props.entity;
		let controller = this.props.controller;
		let postfix = "";

		if (entity.isPremium()) {
			postfix = "_premium";
		}

		if (entity.isTaunter()) {
			images.push({
				image: `inplay_minion_taunt${postfix}.png`,
				classes: ["inplay-taunt"]
			});
		}

		images.push({
			image: entity.cardId,
			isArt: true,
			classes: ["inplay-portrait"]
		});

		if (entity.isStealthed()) {
			images.push({
				image: "inplay_minion_stealth.png",
				classes: ["inplay-stealth"]
			});
		}

		if (entity.cantBeTargeted()) {
			images.push({
				image: "inplay_minion_untargetable.png",
				classes: ["inplay-untargetable"]
			});
		}

		if (entity.getTag(GameTag.HIDE_STATS)) {
			images.push({
				image: `inplay_minion_hide_stats${postfix}.png`,
				classes: ["inplay-base"]
			});
		} else {
			images.push({
				image: `inplay_minion${postfix}.png`,
				classes: ["inplay-base"]
			});
		}

		if (entity.isLegendary()) {
			images.push({
				image: `inplay_minion_legendary${postfix}.png`,
				classes: ["inplay-legendary"]
			});
		}

		if (entity.isFrozen()) {
			images.push({
				image: "inplay_minion_frozen.png",
				classes: ["inplay-frozen"]
			});
		}

		if (entity.isDivineShielded()) {
			images.push({
				image: "inplay_minion_divine_shield.png",
				classes: ["inplay-divine-shield"]
			});
		}

		if (entity.isImmune()) {
			images.push({
				image: "inplay_minion_immune.png",
				classes: ["inplay-immune"]
			});
		}

		if (entity.isSilenced()) {
			images.push({
				image: "inplay_minion_silenced.png",
				classes: ["inplay-silenced"]
			});
		}

		if (entity.isEnraged()) {
			images.push({
				image: "inplay_minion_enraged.png",
				classes: ["inplay-enraged"]
			});
		}

		if (this.props.buffed) {
			images.push({
				image: "inplay_minion_buffed.png",
				classes: ["inplay-buffed"]
			});
		}

		if (entity.getTag(GameTag.INSPIRE) > 0) {
			images.push({
				image: "icon_inspire.png",
				classes: ["icon-inspire"]
			});
		} else if (entity.getTag(GameTag.DEATHRATTLE) > 0) {
			images.push({
				image: "icon_deathrattle.png",
				classes: ["icon-deathrattle"]
			});
		} else if (entity.getTag(GameTag.POISONOUS) > 0) {
			images.push({
				image: "icon_poisonous.png",
				classes: ["icon-poisonous"]
			});
		} else if (entity.getTag(GameTag.TRIGGER_VISUAL) > 0) {
			images.push({
				image: "icon_trigger.png",
				classes: ["icon-trigger"]
			});
		}

		if (entity.isAsleep(controller)) {
			images.push({
				image: "effect_sleep.png",
				classes: ["effect-sleep"]
			});
		}

		if(this.props.damage && this.props.damage > 0) {
			images.push({
				image: "damage.png",
				classes: ["dmg"]
			});
		}
		else if(this.props.healing && this.props.healing > 0) {
			images.push({
				image: "healing.png",
				classes: ["heal"]
			});
		}
		else if (entity.getTag(GameTag.HEALTH) - entity.getTag(GameTag.DAMAGE) <= 0) {
			images.push({
				image: "skull.png",
				classes: ["skull"]
			});
		}

		return (
			<CardArt layers={images} scale={0.86} square={false} margin={false}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
				/>
		);
	}
}
