import * as React from "react";
import * as _ from "lodash";
import EntityList from "./EntityList";
import Entity from "../../Entity";
import Option from "../../Option";
import Minion from "./Minion";
import {EntityListProps} from "../../interfaces";

interface FieldProps extends EntityListProps {
	buffedEntities?: number[];
}

export default class Field extends EntityList<FieldProps> {

	public shouldComponentUpdate(nextProps: FieldProps, nextState): boolean {
		if (!_.isEqual(nextProps.buffedEntities, this.props.buffedEntities)) {
			return true;
		}
		return super.shouldComponentUpdate(nextProps, nextState);
	}

	protected className(): string {
		return "field";
	}

	protected renderEntity(entity: Entity, option: Option) {
		return <Minion
			entity={entity}
			option={option}
			optionCallback={this.props.optionCallback}
			assetDirectory={this.props.assetDirectory}
			cardArtDirectory={this.props.cardArtDirectory}
			cards={this.props.cards}
			controller={this.props.controller}
			descriptors={this.props.descriptors}
			buffed={entity && this.props.buffedEntities && this.props.buffedEntities.indexOf(entity.id) !== -1}
		/>;
	}
}
