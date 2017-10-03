import * as React from "react";
import {CardType} from "../../../enums";
import Entity from "../../../Entity";
import CardArt from "./CardArt";
import {EntityProps} from "../../../interfaces";
import InPlayCardArt from "./InPlayCardArt";

export default class WeaponArt extends React.Component<EntityProps, void> {
	public render(): JSX.Element {
		let images = [];
		let entity = this.props.entity;

		images.push({
			image: entity.cardId,
			isArt: true,
			classes: ["hero-weapon-portrait"]
		});

		let frame = "inplay_weapon.png";
		// TODO: weapon isn't actually sheathed when exhausted, end of turn
		if (entity.isExhausted())
			frame = "inplay_weapon_dome.png";

		images.push({
			image: frame,
			classes: ["hero-weapon-frame"]
		});

		return (
			<CardArt layers={images} scale={1} square={true} margin={true}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
				/>
		);
	}
}
