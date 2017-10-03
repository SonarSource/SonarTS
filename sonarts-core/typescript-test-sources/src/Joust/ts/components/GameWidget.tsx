import * as React from "react";
import {CardData, GameWidgetProps} from "../interfaces";
import Scrubber from "./Scrubber";
import EventLog from "./EventLog";
import GameState from "../state/GameState";
import GameWrapper from "./GameWrapper";
import * as Immutable from "immutable";
import {Zone} from "../enums";
import Entity from "../Entity";
import {cookie} from "cookie_js";
import screenfull from "screenfull";

interface GameWidgetState {
	gameState?: GameState;
	swapPlayers?: boolean;
	isFullscreen?: boolean;
	isFullscreenAvailable?: boolean;
	fullscreenError?: boolean;
	cardOracle?: Immutable.Map<number, string>;
	mulliganOracle?: Immutable.Map<number, boolean>;
	cards?: Immutable.Map<string, CardData>;
	isRevealingCards?: boolean;
	isLogVisible?: boolean;
	isLogMounted?: boolean;
}

export default class GameWidget extends React.Component<GameWidgetProps, GameWidgetState> {
	private cb;
	private cardOracleCb;
	private mulliganOracleCb;
	private ref: HTMLDivElement;
	private fullscreenErrorTimeout = null;
	private hasCheckedForSwap = false;
	private swapPlayers = true;

	constructor(props: GameWidgetProps) {
		super(props);
		this.state = {
			gameState: null,
			swapPlayers: !!this.props.startSwapped,
			isFullscreen: false,
			isFullscreenAvailable: screenfull.enabled,
			fullscreenError: false,
			isRevealingCards: typeof this.props.startRevealed === "undefined" ? true : this.props.startRevealed,
			cardOracle: Immutable.Map<number, string>(),
			mulliganOracle: null,
			isLogVisible: false, // we might show it once we receive the first game state
			isLogMounted: false,
		};
	}

	public componentDidMount() {
		this.cb = this.setGameState.bind(this);
		this.props.sink.once("gamestate", () => {
			const showLog = !!+cookie.get("joust_event_log", "0");
			if (showLog) {
				this.setState({
					isLogVisible: true,
					isLogMounted: true,
				});
			}
		});
		this.props.sink.on("gamestate", this.cb.bind(this));
		screenfull.onchange(() => {
			if(screenfull.isFullscreen) {
				this.onAttainFullscreen();
			}
			else {
				this.onReleaseFullscreen();
			}
		});
		screenfull.onerror(() => {
			this.setState({fullscreenError: true});
			this.clearFullscreenErrorTimeout();
			this.fullscreenErrorTimeout = window.setTimeout(() => {
				this.setState({fullscreenError: false});
			}, 3000);
		});
		this.cardOracleCb = this.updateCardOracle.bind(this);
		this.mulliganOracleCb = this.updateMulliganOracle.bind(this);
		if (this.props.cardOracle) {
			this.props.cardOracle.on("cards", this.cardOracleCb);
		}
		if (this.props.cardOracle) {
			this.props.mulliganOracle.on("mulligans", this.mulliganOracleCb);
		}
	}

	private track(event: string, values: Object, tags?: Object): void {
		if (!this.props.events) {
			return;
		}
		this.props.events(event, values, tags || {});
	}

	protected setGameState(gameState: GameState): void {
		this.setState({gameState: gameState});
	}

	private clearFullscreenErrorTimeout() {
		if (this.fullscreenErrorTimeout) {
			window.clearTimeout(this.fullscreenErrorTimeout);
			this.fullscreenErrorTimeout = null;
		}
	}

	protected componentWillUnmount() {
		this.props.sink.removeListener("gamestate", this.cb);
		this.clearFullscreenErrorTimeout();
		this.props.cardOracle.removeListener("cards", this.cardOracleCb);
		this.props.cardOracle.removeListener("mulligans", this.mulliganOracleCb);
	}

	protected onClickExit(e): void {
		e.preventDefault();
		if (this.props.exitGame) {
			this.props.exitGame();
		}
	}

	protected onAttainFullscreen() {
		this.setState({isFullscreen: true});
		if ("orientation" in screen && typeof screen.orientation.lock === "function") {
			screen.orientation.lock("landscape").catch((err) => {
				console.warn(err);
			});
		}
		if (this.props.onFullscreen) {
			this.props.onFullscreen(true);
		}
		this.triggerResize();

	}

	protected onReleaseFullscreen() {
		this.setState({isFullscreen: false});
		if ("orientation" in screen && typeof screen.orientation.unlock === "function") {
			screen.orientation.unlock();
		}
		if (this.props.onFullscreen) {
			this.props.onFullscreen(false);
		}
		this.triggerResize();
	}

	public enterFullscreen() {
		screenfull.request(this.ref);
	}

	public exitFullscreen() {
		screenfull.exit();
	}

	protected updateCardOracle(cards: Immutable.Map<number, string>) {
		this.setState({cardOracle: cards});
	}

	protected updateMulliganOracle(mulligans: Immutable.Map<number, boolean>) {
		this.setState({mulliganOracle: mulligans});
	}

	public setCards(cards: CardData[]) {
		let cardMap = null;
		if (cards) {
			if (!cards.length) {
				console.error('Got invalid card data to metadata callback (expected card data array)');
				return;
			}
			cardMap = Immutable.Map<string, CardData>();

			cardMap = cardMap.withMutations((map) => {
				cards.forEach((card: CardData) => {
					map = map.set(card.id, card);
				});
			});
		}
		this.setState({cards: cardMap});
	}

	/**
	 * Trigger a window.resize event.
	 * This fixes react-dimensions not picking up fullscreen/minimize events.
	 */
	protected triggerResize() {
		try {
			let event = document.createEvent('UIEvents');
			event.initUIEvent('resize', true, false, window, 0);
			window.dispatchEvent(event);
		} catch (e) {
		}
	}

	private checkForSwap() {
		if (!this.state.gameState) {
			return;
		}
		let players = this.state.gameState.getPlayers();
		if (!players.length) {
			return;
		}
		let player = players[0];
		let cards = this.state.gameState.entityTree.get(player.playerId).get(Zone.HAND);
		if (cards && cards.count() > 0) {
			this.hasCheckedForSwap = true;
			cards.forEach((card: Entity) => {
				if (!card.revealed) {
					this.swapPlayers = false;
					return false;
				}
			});
		}
	}

	public render(): JSX.Element {

		if (!this.hasCheckedForSwap) {
			this.checkForSwap();
		}

		let parts = [];

		if (this.props.exitGame) {
			parts.push(<div id="joust-quit" key="exit"><a href="#"
														  onClick={this.onClickExit.bind(this) }>Exit Game</a>
			</div>);
		}

		let isSwapped = this.swapPlayers !== this.state.swapPlayers /* XOR */;

		let game = <GameWrapper
			key="game"
			state={this.state.gameState}
			interaction={this.props.interaction}
			assetDirectory={this.props.assetDirectory}
			cardArtDirectory={this.props.cardArtDirectory}
			cards={this.state.cards}
			swapPlayers={isSwapped}
			hasStarted={this.props.scrubber.canInteract()}
			cardOracle={this.state.cardOracle}
			mulliganOracle={this.state.mulliganOracle}
			hideCards={!this.state.isRevealingCards}
			playerNames={this.props.playerNames || null}
			loadingError={this.props.loadingError}
		/>;
		let log = <EventLog
			key="log"
			state={this.state.gameState}
			cards={this.state.cards}
			cardOracle={this.state.cardOracle}
			tail={this.props.scrubber.getHistory().tail}
			currentTime={this.props.scrubber.getCurrentTime()}
			isHidden={!this.state.isLogVisible}
		/>;

		parts.push(
			<div key="game-wrapper" className="game-wrapper">
				{game}
				{this.state.isLogMounted || this.state.isLogVisible ? log : null}
			</div>
		);

		if (this.props.scrubber) {
			parts.push(<Scrubber
				key="scrubber"
				scrubber={this.props.scrubber}
				swapPlayers={() => {
					let newSwap = !this.state.swapPlayers;
					this.setState({ swapPlayers: newSwap });
					if(this.props.onToggleSwap) {
						this.props.onToggleSwap(newSwap);
					}
				}}
				isSwapped={isSwapped}
				isFullscreen={this.state.isFullscreen}
				isFullscreenAvailable={this.state.isFullscreenAvailable}
				fullscreenError={this.state.fullscreenError}
				onClickFullscreen={() => this.enterFullscreen()}
				onClickMinimize={() => this.exitFullscreen()}
				isRevealingCards={this.state.isRevealingCards}
				canRevealCards={!!this.state.cardOracle}
				onClickHideCards={() => {
					this.setState({ isRevealingCards: false });
					if(this.props.onToggleReveal) {
						this.props.onToggleReveal(false);
					}
				}}
				onClickRevealCards={() => {
					this.setState({ isRevealingCards: true });
					if(this.props.onToggleReveal) {
						this.props.onToggleReveal(true);
					}
				}}
				isLogVisible={this.state.isLogVisible}
				toggleLog={() => {
					const newState = !this.state.isLogVisible;
					this.setState({ isLogVisible: newState, isLogMounted: true });
					cookie.set("joust_event_log", "" + (+newState), {
						expires: 365, // one year
						path: "/",
					});
				}}
				enableKeybindings={this.props.enableKeybindings}
				locale={this.props.locale}
				onSelectLocale={this.props.selectLocale && ((locale: string, loaded?: () => void) => this.props.selectLocale(locale, loaded))}
			/>);
		}

		let style = {};
		if (!this.state.isFullscreen) {
			if (this.props.width) {
				style['width'] = this.props.width;
			}
			if (this.props.height) {
				style['height'] = this.props.height;
			}
		}

		let classes = ['joust-widget', 'game-widget'];
		if (this.state.isFullscreen) {
			classes.push('joust-fullscreen');
		}

		return (
			<div className={classes.join(' ')} ref={(ref) => this.ref = ref} style={style}
				 onContextMenu={(e) => e.preventDefault()}>
				{parts}
			</div>
		);
	}

	public shouldComponentUpdate(nextProps: GameWidgetProps, nextState: GameWidgetState) {
		if (this.state.cardOracle !== nextState.cardOracle) {
			if (this.props.scrubber && this.props.scrubber.isPlaying()) {
				return false;
			}
		}
		return true;
	}
}
