import * as React from "react";
import {EntityInPlayProps} from "../../interfaces";
import Attack from "./stats/Attack";
import Durability from "./stats/Durability";
import WeaponArt from "./visuals/WeaponArt";
import EntityInPlay from "./EntityInPlay";
import Card from "./Card"
import {GameTag} from "../../enums";

export default class Weapon extends EntityInPlay<EntityInPlayProps> {

	constructor() {
		super('weapon');
	}

	public jsx() {
		let entity = this.props.entity;
		let defaultAttack = null;
		let defaultDurability = null;
		if (this.props.cards && this.props.cards.has(entity.cardId)) {
			let data = this.props.cards.get(entity.cardId);
			defaultAttack = data.attack;
			defaultDurability = data.durability;
		}

		let components = [
			<WeaponArt
				key="art"
				entity={entity}
				cards={this.props.cards}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
			/>,
			<div className="stats" key="stats">
				<Attack attack={entity.getAtk() } default={defaultAttack}/>
				<Durability durability={entity.getDurability() } damage={entity.getDamage() }
							default={defaultDurability}/>
			</div>,
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

		return components;
	}
}
