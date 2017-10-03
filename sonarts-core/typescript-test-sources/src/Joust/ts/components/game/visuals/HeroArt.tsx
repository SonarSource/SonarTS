import * as React from "react";
import * as Immutable from "immutable";
import {CardClass, GameTag, Zone} from "../../../enums";
import Entity from "../../../Entity";
import CardArt from "./CardArt";
import {EntityProps} from "../../../interfaces";

interface HeroArtProps extends EntityProps {
	secrets: Immutable.Map<number, Entity>;
}

export default class HeroArt extends React.Component<HeroArtProps, void> {

	shouldComponentUpdate(nextProps: HeroArtProps, nextState: {}, nextContext: any): boolean {
		return (
			nextProps.entity !== this.props.entity ||
			nextProps.damage !== this.props.damage ||
			nextProps.healing !== this.props.healing ||
			nextProps.controller !== this.props.controller ||
			nextProps.assetDirectory !== this.props.assetDirectory ||
			nextProps.cardArtDirectory !== this.props.cardArtDirectory ||
			nextProps.secrets !== this.props.secrets
		);
	}

	public render(): JSX.Element {
		let images = [];
		let entity = this.props.entity;

		images.push({
			image: entity.cardId,
			isArt: true,
			classes: ["hero-portrait"],
		});

		images.push({
			image: "hero_frame.png",
			classes: ["hero-frame"],
		});

		if (entity.isFrozen()) {
			images.push({
				image: "inplay_hero_frozen.png",
				classes: ["hero-frozen"],
			});
		}

		if (entity.isImmune()) {
			images.push({
				image: "inplay_hero_immune.png",
				classes: ["hero-immune"],
			});
		}

		if (entity.getAtk() > 0) {
			images.push({
				image: "hero_attack.png",
				classes: ["hero-attack"],
			});
		}

		if (entity.getArmor() > 0) {
			images.push({
				image: "hero_armor.png",
				classes: ["hero-armor"],
			});
		}

		let hasQuest = this.props.secrets.some((potentialQuest: Entity) => !!potentialQuest.getTag(GameTag.QUEST));

		if (hasQuest) {
			images.push({
				image: "quest.png",
				classes: ["secret"],
			});
		}
		else if (this.props.secrets.count() > 0) {
			let image = "secret_sheathed.png";
			let secret = this.props.secrets.first();
			if (!secret.getTag(GameTag.EXHAUSTED)) {
				switch (secret.getClass()) {
					case CardClass.HUNTER:
						image = "secret_hunter.png";
						break;
					case CardClass.MAGE:
						image = "secret_mage.png";
						break;
					case CardClass.PALADIN:
						image = "secret_paladin.png";
						break;
				}
			}
			images.push({
				image: image,
				classes: ["secret"],
			});
		}

		if (entity.getTag(GameTag.HEALTH) - entity.getTag(GameTag.DAMAGE) <= 0 || entity.getTag(GameTag.ZONE) != Zone.PLAY) {
			images.push({
				image: "skull.png",
				classes: ["skull"],
			});
		}

		if (this.props.damage && this.props.damage > 0) {
			images.push({
				image: "damage.png",
				classes: ["dmg"],
			});
		}
		else if (this.props.healing && this.props.healing > 0) {
			images.push({
				image: "healing.png",
				classes: ["heal"],
			});
		}

		return (
			<CardArt
				layers={images}
				scale={1}
				square={true}
				margin={false}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
			/>
		);
	}
}
