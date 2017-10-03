import * as React from "react";
import {EntityInPlayProps} from "../../interfaces";
import EntityInPlay from "./EntityInPlay";
import Cost from "./stats/Cost";
import Card from "./Card"
import HeroPowerArt from "./visuals/HeroPowerArt";
import {GameTag} from "../../enums";

interface HeroPowerProps extends EntityInPlayProps {
	activated?: boolean;
}

export default class HeroPower extends EntityInPlay<HeroPowerProps> {
	constructor() {
		super('heroPower');
	}

	protected playWithClick():boolean {
		return true;
	}

	protected getClassNames(): string[] {
		let classNames = super.getClassNames();
		if (this.props.activated) {
			classNames.push("highlight");
		}
		return classNames;
	}

	protected jsx() {
		let defaultCost = null;
		if (this.props.cards && this.props.cards.has(this.props.entity.cardId)) {
			let data = this.props.cards.get(this.props.entity.cardId);
			defaultCost = data.cost;
		}

		let entity = this.props.entity;

		let components = [
			<HeroPowerArt
				key="art"
				entity={entity}
				cards={this.props.cards}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
			/>
		];

		if (this.state.isHovering) {
			components.push(<div key="hover" className="mouse-over">
				<Card
					entity={entity}
					assetDirectory={this.props.assetDirectory}
					cards={this.props.cards}
					isHidden={false}
					controller={this.props.controller}
					cardArtDirectory={this.props.cardArtDirectory}
					option={null}
				/></div>);
		}

		if (!entity.isExhausted()) {
			components.push(<Cost
				key="cost"
				cost={entity.getCost()}
				default={defaultCost}
			/>);
		}

		return components;
	}
}
