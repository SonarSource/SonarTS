import * as React from "react";
import GameState from "../state/GameState";
import {GameTag} from "../enums";

interface TurnProps extends React.ClassAttributes<Turn> {
	state?: GameState;
	mulligan?: boolean;
	totalDuration: number;
	duration: number;
	turnNumber?: number;
	invert?: boolean;
}

export default class Turn extends React.Component<TurnProps, void> {
	public render(): JSX.Element {
		if (!this.props.totalDuration) {
			return null;
		}

		let classNames = ["joust-scrubber-turn"];

		let width = 100 / this.props.totalDuration * this.props.duration;
		let style = {width: width + "%"};

		if (this.props.state) {
			let flip = 0;
			let player = this.props.state.getPlayer(1);
			if (player) {
				flip += player.getTag(GameTag.FIRST_PLAYER) ? 1 : 0;
			}
			let game = this.props.state.game;
			if (game) {
				classNames.push((!!((game.getTag(GameTag.TURN) + flip) % 2) != this.props.invert) ? "top" : "bottom");
			}
		}
		else if (this.props.mulligan) {
			classNames.push("mulligan");
		}

		let prettyTurn = (this.props.turnNumber % 2) ? Math.floor(this.props.turnNumber / 2) + 1 : null;
		if (prettyTurn) {
			classNames.push("text");
			classNames.push(prettyTurn % 2 ? "odd" : "even");
		}

		return (
			<section
				className={classNames.join(" ") }
				style={style}
			>
				{this.props.mulligan ? "M" : prettyTurn}
			</section>
		);
	}
}
