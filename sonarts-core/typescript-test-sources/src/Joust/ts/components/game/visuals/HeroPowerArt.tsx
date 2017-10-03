import * as React from "react";
import {CardType} from "../../../enums";
import Entity from "../../../Entity";
import CardArt from "./CardArt";
import {EntityProps} from "../../../interfaces";
import InPlayCardArt from "./InPlayCardArt";

export default class HeroPowerArt extends React.Component<EntityProps, void> {
	public render(): JSX.Element {
		let images = [];
		let entity = this.props.entity;

		images.push({
			image: entity.cardId,
			isArt: true,
			classes: ["hero-power-portrait"]
		});

		let frame = "hero_power.png";
		if (entity.isExhausted())
			frame = "hero_power_exhausted.png";

		images.push({
			image: frame,
			classes: ["hero-power-frame"]
		});

		return (
			<CardArt layers={images} scale={1} square={true} margin={true}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
				/>
		);
	}
}
