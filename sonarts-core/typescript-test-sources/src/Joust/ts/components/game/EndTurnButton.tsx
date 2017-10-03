import * as React from "react";

import {OptionProps} from "../../interfaces";
import Player from "../../Player";

interface EndTurnButtonProps extends OptionProps, React.ClassAttributes<EndTurnButton> {
	onlyOption?: boolean;
	currentPlayer: Player;
}

export default class EndTurnButton extends React.Component<EndTurnButtonProps, void> {

	public endTurn() {
		if (!this.props.option || !this.props.optionCallback) {
			return;
		}
		this.props.optionCallback(this.props.option);
	}

	public render(): JSX.Element {
		let classNames = ['endTurnButton'];
		if (this.props.option) {
			classNames.push('playable');
		}
		if (this.props.onlyOption) {
			classNames.push('only-option');
		}
		return (
			<div className={classNames.join(' ') }>
				<button disabled={!this.props.option || !this.props.optionCallback} onClick={this.endTurn.bind(this) }>End Turn</button>
			</div>
		);
	}
}
