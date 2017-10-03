import * as React from "react";
import * as Immutable from "immutable";
import EntityList from "./EntityList";
import Entity from "../../Entity";
import Option from "../../Option";
import Card from "./Card";
import {EntityListProps, MulliganOracleProps} from "../../interfaces";
import Choice from "../../Choice";

interface ChoicesProps extends EntityListProps, MulliganOracleProps {
	isMulligan: boolean;
	choices: Immutable.Map<number, Choice>;
}

export default class Choices extends EntityList<ChoicesProps> {

	protected className(): string {
		return 'choices';
	}

	protected sort(entity: Entity): number {
		return this.props.choices.get(entity.id).index;
	}

	private lookup(id: number): string|null {
		if (!this.props.cardOracle) {
			return null;
		}
		return this.props.cardOracle.get(id) || null;
	}

	protected renderEntity(entity: Entity, option: Option, index?: number): JSX.Element {

		let hidden = false;

		const cardId = entity.cardId || this.lookup(entity.id);

		// hide the coin, see initial change in #85 and simpler check after #163
		if (this.props.isMulligan && cardId === "GAME_005") {
			return null;
		}

		// reveal or hide entity
		if (this.props.hideCards) {
			entity = new Entity(entity.id, entity.getTags());
		}
		else if (!entity.cardId && cardId) {
			entity = new Entity(entity.id, entity.getTags(), cardId);
			hidden = true;
		}

		// mulligan cards
		let mulligan = false;
		if (this.props.isMulligan && this.props.mulliganOracle && this.props.mulliganOracle.get(entity.id) === true) {
			mulligan = true;
		}

		return (
			<Card
				entity={entity}
				option={option}
				optionCallback={this.props.optionCallback}
				assetDirectory={this.props.assetDirectory}
				cards={this.props.cards}
				isHidden={hidden}
				controller={this.props.controller}
				cardArtDirectory={this.props.cardArtDirectory}
				mulligan={mulligan}
			/>);
	}
}
