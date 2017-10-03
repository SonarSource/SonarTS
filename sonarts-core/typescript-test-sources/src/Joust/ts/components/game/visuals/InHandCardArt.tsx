import * as React from "react";
import {CardClass, CardType} from "../../../enums";
import CardArt from "./CardArt";
import {EntityProps} from "../../../interfaces";

interface InHandCardArtProps extends EntityProps, React.ClassAttributes<InHandCardArt> {
	hidden: boolean;
	cardType?: number;
	cardClass?: number;
	mulligan?: boolean;
}

export default class InHandCardArt extends React.Component<InHandCardArtProps, void> {
	public render(): JSX.Element {
		let images = [];
		let entity = this.props.entity;
		let portraitClass = null;
		let frame = null;
		let premiumOverlay = null;
		let premiumOverlayClass = null;
		let cardClass = this.cardClassToString();

		if (this.props.hidden) {
			images.push({
				image: "cardback.png",
				classes: ["inhand-base", "cardback"]
			});
		} else {
			switch (this.props.cardType) {
				case CardType.MINION:
					portraitClass = "inhand-minion";
					if (entity.isPremium()) {
						frame = "inhand_minion_premium.png";
						premiumOverlay = "premium-minion-overlay.png";
						premiumOverlayClass = cardClass + "-color";
					} else {
						frame = "inhand_minion_" + cardClass + ".png";
					}
					break;
				case CardType.WEAPON:
					portraitClass = "inhand-weapon";
					if (entity.isPremium()) {
						frame = "inhand_weapon_premium.png";
						premiumOverlay = "premium-weapon-overlay.png";
						premiumOverlayClass = cardClass + "-color";
					} else {
						frame = "inhand_weapon_neutral.png";
					}
					break;
				case CardType.SPELL:
				case CardType.HERO_POWER:
				default:
					portraitClass = "inhand-spell";
					if (entity.isPremium()) {
						frame = "inhand_spell_premium.png";
						premiumOverlay = "premium-spell-overlay.png";
						premiumOverlayClass = cardClass + "-color";
					} else {
						frame = "inhand_spell_" + cardClass + ".png";
					}
					break;
			}

			images.push({
				image: entity.cardId,
				isArt: true,
				classes: [portraitClass]
			});
		}

		images.push({
			image: frame,
			classes: ["inhand-base"]
		});

		if (entity.isPremium()) {
			images.push({
				image: premiumOverlay,
				classes: ["inhand-base", premiumOverlayClass],
			})
		}

		if (!this.props.hidden && entity.cardId && entity.isLegendary()) {
			if (this.props.cardType === CardType.MINION) {
				images.push({
					image: "inhand_minion_legendary" + (entity.isPremium() ? "_premium" : "") + ".png",
					classes: ["inhand-legendary"],
				});
			}
			if (this.props.cardType === CardType.SPELL) {
				images.push({
					image: "inhand_spell_legendary" + (entity.isPremium() ? "_premium" : "") + ".png",
					classes: ["inhand-legendary"],
				});
			}
		}

		if (this.props.mulligan) {
			images.push({
				image: "inhand_mulligan.png",
				classes: ["inhand-mulligan"]
			});
		}

		return (
			<CardArt layers={images} scale={0.71} square={false} margin={false} assetDirectory={this.props.assetDirectory} cardArtDirectory={this.props.cardArtDirectory} />
		);
	}

	private cardClassToString(): string {
		switch (this.props.cardClass) {
			case CardClass.DRUID:
				return "druid";
			case CardClass.DREAM:
			case CardClass.HUNTER:
				return "hunter";
			case CardClass.MAGE:
				return "mage";
			case CardClass.PALADIN:
				return "paladin";
			case CardClass.PRIEST:
				return "priest";
			case CardClass.ROGUE:
				return "rogue";
			case CardClass.SHAMAN:
				return "shaman";
			case CardClass.WARLOCK:
				return "warlock";
			case CardClass.WARRIOR:
				return "warrior";
			default:
				return "neutral";
		}
	}
}
