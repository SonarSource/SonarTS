import * as React from "react";
import EntityList from "./EntityList";
import {EntityListProps} from "../../interfaces";

interface DeckProps extends EntityListProps {
	fatigue: number;
}

export default class Deck extends EntityList<DeckProps> {

	protected className(): string {
		return 'deck';
	}

	public render(): JSX.Element {
		let tooltip = null;
		let classNames = [this.className()];
		switch (this.props.entities.size) {
			case 0:
				tooltip = this.props.fatigue + ' damage dealt by next card draw';
				classNames.push('fatigue');
				break;
			case 1:
				tooltip = '1 card remaining';
				break;
			default:
				tooltip = this.props.entities.size + ' cards remaining';
				break;
		}
		return (
			<div className={classNames.join(' ') } title={tooltip}>
				<figure>
					<img src={this.props.assetDirectory('images/cardback.png')} />
					<figcaption>{this.props.entities.size || -this.props.fatigue}</figcaption>
				</figure>
			</div>);
	}

	public shouldComponentUpdate(nextProps: DeckProps, nextState) {
		return (
			this.props.fatigue !== nextProps.fatigue ||
			super.shouldComponentUpdate(nextProps, nextState)
		);
	}
}
