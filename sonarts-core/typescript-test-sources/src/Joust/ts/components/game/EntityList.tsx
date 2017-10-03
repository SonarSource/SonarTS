import * as React from "react";
import {EntityListProps} from "../../interfaces";
import Entity from "../../Entity";
import Option from "../../Option";

abstract class EntityList<T extends EntityListProps> extends React.Component<T, void> {

	protected renderEntity(entity: Entity, option: Option, index?: number) {
		let id = entity.cardId ? (' (CardID=' + entity.cardId + ')') : '';
		return (<span>Entity #{entity.id }{id}</span>);
	}

	protected sort(entity: Entity): number {
		return entity.getZonePosition();
	}

	protected beforeRender(entities: number) { }

	protected abstract className(): string;

	public render(): JSX.Element {
		let elements = [];
		if (this.props.entities) {
			let entities = this.props.entities.toList().sortBy(this.sort.bind(this));
			this.beforeRender(entities.count());
			entities.forEach((entity, i) => {
				let option = this.props.options ? this.props.options.get(entity.id) : null;
				let rendered = this.renderEntity(entity, option, i);
				if(!rendered) {
					return;
				}
				elements.push(
					<li key={entity.id }>
						{rendered}
					</li>);
			});
		}
		let classNames = ['entity-list'];
		classNames.push(this.className());
		return (
			<ul className={classNames.join(' ') }>
				{elements}
			</ul>
		);
	}

	public shouldComponentUpdate(nextProps: EntityListProps, nextState) {
		return (
			this.props.entities !== nextProps.entities ||
			this.props.controller !== nextProps.controller ||
			this.props.options !== nextProps.options ||
			this.props.optionCallback !== nextProps.optionCallback ||
			this.props.cardOracle !== nextProps.cardOracle ||
			this.props.cards !== nextProps.cards ||
			this.props.descriptors !== nextProps.descriptors ||
			this.props.hideCards !== nextProps.hideCards
		);
	}
}

export default EntityList;
