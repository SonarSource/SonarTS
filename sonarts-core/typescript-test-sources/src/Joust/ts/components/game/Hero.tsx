import * as React from "react";
import * as Immutable from "immutable";
import EntityInPlay from "./EntityInPlay";
import {CardOracleProps, EntityInPlayProps} from "../../interfaces";
import Entity from "../../Entity";
import Attack from "./stats/Attack";
import Damage from "./stats/Damage";
import Healing from "./stats/Healing";
import Health from "./stats/Health";
import Armor from "./stats/Armor";
import SecretText from "./stats/SecretText";
import HeroArt from "./visuals/HeroArt";
import {GameTag, MetaDataType} from "../../enums";
import MetaData from "../../MetaData";
import GameStateDescriptor from "../../state/GameStateDescriptor";

interface HeroProps extends EntityInPlayProps, CardOracleProps {
	secrets: Immutable.Map<number, Entity>;
}

export default class Hero extends EntityInPlay<HeroProps> {
	constructor() {
		super('hero');
	}

	protected jsx() {
		let entity = this.props.entity;

		let secrets = this.props.secrets;
		let quests = [];

		let hasQuest = secrets.some((potentialQuest: Entity) => !!potentialQuest.getTag(GameTag.QUEST));
		let secretCount = secrets.count();

		// build text in icon
		let secretText = hasQuest ? "!" : (secretCount > 1 ? "" + secretCount : "?");

		// build title
		let secretTitle = this.props.secrets.reduce((title, entity: Entity): string => {
			let name = entity.cardId;
			if (!entity.revealed) {
				if (this.props.cardOracle && this.props.cardOracle.has(entity.id)) {
					name = this.props.cardOracle.get(entity.id);
				}
				else {
					return title;
				}
			}
			if (title) {
				title += ", ";
			}
			if (this.props.cards && this.props.cards.has(name)) {
				name = this.props.cards.get(name).name || name;
			}
			return title += name;
		}, "");

		let damage = 0;
		let healing = 0;

		if (this.props.descriptors) {
			this.props.descriptors.forEach((descriptor: GameStateDescriptor) => {
				descriptor.metaData.forEach((metaData: MetaData) => {
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

		return [
			<HeroArt
				key="art"
				entity={entity}
				secrets={this.props.secrets}
				cards={this.props.cards}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
				damage={damage}
				healing={healing}
			/>,
			<div key="stats" className="stats">
				{entity.getAtk() ? <Attack attack={entity.getAtk()} /> : null}
				<Health health={entity.getHealth() } damage={entity.getDamage()} />
				{entity.getArmor() ? <Armor armor={entity.getArmor()} /> : null}
				{(hasQuest || secretCount > 0) ? <SecretText text={secretText} title={secretTitle} /> : null}
				{damage != 0 ? <Damage damage={damage} /> : null}
				{healing != 0 ? <Healing healing={healing} /> : null}
			</div>,
		];
	}
}
