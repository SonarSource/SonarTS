import * as React from "react";
import * as Immutable from "immutable";
import {
	CardDataProps,
	HideCardsProps,
	InteractiveBackend,
	CardOracleProps,
	AssetDirectoryProps,
	CardArtDirectory,
	MulliganOracleProps
} from "../interfaces";
import GameState from "../state/GameState";
import TwoPlayerGame from "./game/TwoPlayerGame";
import {CardType, OptionType} from "../enums";
import Entity from "../Entity";
import Option from "../Option";
import PlayerEntity from "../Player";
import LoadingScreen from "./LoadingScreen";
import * as bowser from "bowser";
import {cookie} from "cookie_js";

interface GameWrapperProps extends CardDataProps, CardOracleProps, MulliganOracleProps, AssetDirectoryProps, CardArtDirectory, HideCardsProps, React.ClassAttributes<GameWrapper> {
	state: GameState;
	interaction?: InteractiveBackend;
	swapPlayers?: boolean;
	hasStarted?: boolean;
	loadingError?: boolean;
	playerNames?: string[]|null;
}

interface GameWrapperState {
	warnAboutBrowser?: boolean;
}

/**
 * This component wraps around the /actual/ game component (such as TwoPlayerGame).
 * It extracts the game entities.
 */
export default class GameWrapper extends React.Component<GameWrapperProps, GameWrapperState> {

	constructor(props: GameWrapperProps, context: any) {
		super(props, context);
		let shouldWarn = false;
		let ignoreWarning = !!(+cookie.get("joust_ludicrous", "0"));
		if (!ignoreWarning) {
			shouldWarn = !(bowser.webkit || (bowser as any).blink || bowser.gecko)
		}
		this.state = {
			warnAboutBrowser: shouldWarn,
		};
	}

	public render(): JSX.Element {

		// replay load failure
		if (this.props.loadingError) {
			const reload = () => {
				document.location.reload();
			};
			return (
				<LoadingScreen>
					<p>Error loading replay.</p>
					<p>
						<a href="#" onClick={reload} onTouchStart={reload}>Try again…</a>
					</p>
				</LoadingScreen>
			);
		}

		// warn about unsupported browsers
		if (this.state.warnAboutBrowser) {
			const ignoreBrowser = (e) => {
				e.preventDefault();
				this.setState({warnAboutBrowser: false});
				cookie.set("joust_ludicrous", "1", {
					expires: 365, // one year
					path: "/",
				});
			};
			return (
				<LoadingScreen>
					<p>
						<small>Sorry, your browser is out of standard right now.<br />Please consider using Chrome or Firefox instead.
						</small>
					</p>
					<p>
						<a href="#" onClick={ignoreBrowser} onTouchStart={ignoreBrowser}>Continue anyway</a>
					</p>
				</LoadingScreen>
			);
		}

		// check if we even have a game state
		let gameState = this.props.state;
		if (!gameState) {
			return this.renderLoadingScreen(this.props.playerNames);
		}

		let entityTree = gameState.entityTree;
		let optionTree = gameState.optionTree;

		// check if any entities are present
		let allEntities = gameState.entities;
		if (!allEntities) {
			return this.renderLoadingScreen(this.props.playerNames);
		}

		// find the game entity
		let game = gameState.game;
		if (!game) {
			return this.renderLoadingScreen(this.props.playerNames);
		}

		// find the players
		if (gameState.getPlayerCount() === 0) {
			return this.renderLoadingScreen(this.props.playerNames);
		}
		let players = allEntities.filter(GameWrapper.filterByCardType(CardType.PLAYER)) as Immutable.Map<number, PlayerEntity>;

		// wait for start
		if (typeof this.props.hasStarted !== "undefined" && !this.props.hasStarted) {
			return this.renderLoadingScreen(players.map((player: PlayerEntity) => {
				return player.name;
			}).toArray());
		}

		// find an end turn option
		let endTurnOption = gameState.options.filter((option: Option) => {
			return !!option && option.type === OptionType.END_TURN;
		}).first();

		let playerCount = players.count();
		switch (playerCount) {
			case 2:
				let player1 = players.first();
				let player2 = players.last();
				if (this.props.swapPlayers) {
					[player1, player2] = [player2, player1];
				}
				return <TwoPlayerGame
					entity={game}
					player1={player1}
					player2={player2}
					entities={entityTree}
					options={optionTree}
					choices={gameState.choices}
					endTurnOption={endTurnOption}
					optionCallback={this.props.interaction && this.props.interaction.sendOption.bind(this.props.interaction) }
					cards={this.props.cards}
					cardOracle={this.props.cardOracle}
					mulliganOracle={this.props.mulliganOracle}
					descriptors={this.props.state.descriptors}
					assetDirectory={this.props.assetDirectory}
					cardArtDirectory={this.props.cardArtDirectory}
					hideCards={this.props.hideCards}
				/>;
			default:
				return <div>Unsupported player count ({playerCount}).</div>
		}
	}

	private renderLoadingScreen(players?: string[]) {
		return <LoadingScreen players={players} />;
	}

	public static filterByCardType(cardType: CardType): (entity: Entity) => boolean {
		return (entity: Entity) => {
			return !!entity && entity.getCardType() === cardType;
		};
	};
}
