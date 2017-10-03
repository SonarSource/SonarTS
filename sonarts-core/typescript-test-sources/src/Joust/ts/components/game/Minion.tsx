import * as React from "react";
import EntityInPlay from "./EntityInPlay";
import {EntityInPlayProps, CardData} from "../../interfaces";
import {GameTag, MetaDataType} from "../../enums";
import InPlayCardArt from "./visuals/InPlayCardArt";
import Attack from "./stats/Attack";
import Health from "./stats/Health";
import Damage from "./stats/Damage";
import Healing from "./stats/Healing";
import MetaData from "../../MetaData";
import GameStateDescriptor from "../../state/GameStateDescriptor";
import Card from "./Card";

export default class Minion extends EntityInPlay<EntityInPlayProps> {

	constructor() {
		super('minion');
	}

	public jsx() {
		let entity = this.props.entity;
		let cardId = entity.cardId;

		let data:CardData = {};
		if (this.props.cards && this.props.cards.has(cardId)) {
			data = this.props.cards.get(cardId);
		}

		let damage = 0;
		let healing = 0;

		if (this.props.descriptors) {
			this.props.descriptors.forEach((descriptor:GameStateDescriptor) => {
				descriptor.metaData.forEach((metaData:MetaData) => {
					if (metaData.entities.has(entity.id)) {
						switch (metaData.type) {
							case MetaDataType.DAMAGE:
								damage += metaData.data;
								break;
							case MetaDataType.HEALING:
								healing += metaData.data;
								break;
						}
					}
				})
			})
		}

		if (data.mechanics && data.mechanics.indexOf("AUTOATTACK") !== -1) {
			entity = entity.setTag(GameTag.AUTOATTACK, 1);
		}

		let components = [
			<InPlayCardArt
				key="art"
				entity={entity}
				controller={this.props.controller}
				cards={this.props.cards}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
				damage={damage}
				healing={healing}
				buffed={this.props.buffed}
			/>,
			<div key="stats" className="stats">
				{entity.getTag(GameTag.HIDE_STATS) == 0 ? [
					<Attack key="attack" attack={entity.getAtk()} default={data.attack}/>,
					<Health key="health" health={entity.getHealth()} damage={entity.getDamage()} default={data.health}/>
				] : null}
				{damage != 0 ? <Damage damage={damage}/> : null}
				{healing != 0 ? <Healing healing={healing}/> : null}
			</div>
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
