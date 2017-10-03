import * as React from "react";
import * as Immutable from "immutable";

import {
	EntityProps, OptionCallbackProps, CardDataProps, CardOracleProps, AssetDirectoryProps,
	GameStateDescriptorStackProps, HideCardsProps, MulliganOracleProps
} from "../../interfaces";
import Entity from "../../Entity";
import Player from "./Player";
import Option from "../../Option";
import PlayerEntity from "../../Player";
import EndTurnButton from "./EndTurnButton";
import {GameTag} from "../../enums";
import Choice from "../../Choice";
import Choices from "../../Choices";

interface TwoPlayerGameProps extends EntityProps, CardDataProps, CardOracleProps, MulliganOracleProps, OptionCallbackProps,
	AssetDirectoryProps, GameStateDescriptorStackProps, HideCardsProps, React.ClassAttributes<TwoPlayerGame> {
	player1: PlayerEntity;
	player2: PlayerEntity;
	entities: Immutable.Map<number, Immutable.Map<number, Immutable.Map<number, Entity>>>;
	options: Immutable.Map<number, Immutable.Map<number, Immutable.Map<number, Option>>>;
	choices: Immutable.Map<number, Choices>;
	endTurnOption?: Option;
}

export default class TwoPlayerGame extends React.Component<TwoPlayerGameProps, void> {

	public render(): JSX.Element {
		let entities = this.props.entities;
		let options = this.props.options;
		let player1 = this.props.player1 as PlayerEntity;
		let player2 = this.props.player2 as PlayerEntity;
		let currentPlayer = player1.getTag(GameTag.CURRENT_PLAYER) ? player1 : player2;

		let emptyEntities = Immutable.Map<number, Immutable.Map<number, Entity>>();
		let emptyOptions = Immutable.Map<number, Immutable.Map<number, Option>>();
		return (
			<div className="game">
				<Player player={player1 as PlayerEntity} isTop={true}
					isCurrent={currentPlayer === player1}
					entities={entities.get(player1.playerId) || emptyEntities}
					options={options.get(player1.playerId) || emptyOptions}
					choices={this.props.choices.get(player1.id)}
					optionCallback={this.props.optionCallback}
					cardOracle={this.props.cardOracle}
					mulliganOracle={this.props.mulliganOracle}
					cards={this.props.cards}
					descriptors={this.props.descriptors}
					assetDirectory={this.props.assetDirectory}
					cardArtDirectory={this.props.cardArtDirectory}
					hideCards={this.props.hideCards}
					/>
				{this.props.optionCallback && <EndTurnButton option={this.props.endTurnOption}
					optionCallback={this.props.optionCallback} onlyOption={options.count() === 0}
					currentPlayer={currentPlayer}
					/>}
				<Player player={player2 as PlayerEntity} isTop={false}
					isCurrent={currentPlayer === player2}
					entities={entities.get(player2.playerId) || emptyEntities}
					options={options.get(player2.playerId) || emptyOptions}
					choices={this.props.choices.get(player2.id)}
					optionCallback={this.props.optionCallback}
					cardOracle={this.props.cardOracle}
					mulliganOracle={this.props.mulliganOracle}
					cards={this.props.cards}
					descriptors={this.props.descriptors}
					assetDirectory={this.props.assetDirectory}
					cardArtDirectory={this.props.cardArtDirectory}
					/>
			</div>
		);
	}

	public shouldComponentUpdate(nextProps: TwoPlayerGameProps, nextState) {
		return (
			this.props.entity !== nextProps.entity ||
			this.props.player1 !== nextProps.player1 ||
			this.props.player2 !== nextProps.player2 ||
			this.props.entities !== nextProps.entities ||
			this.props.options !== nextProps.options ||
			this.props.choices !== nextProps.choices ||
			this.props.endTurnOption !== nextProps.endTurnOption ||
			this.props.optionCallback !== nextProps.optionCallback ||
			this.props.cardOracle !== nextProps.cardOracle ||
			this.props.cards !== nextProps.cards ||
			this.props.descriptors !== nextProps.descriptors ||
			this.props.hideCards !== nextProps.hideCards
	);
	}
}
