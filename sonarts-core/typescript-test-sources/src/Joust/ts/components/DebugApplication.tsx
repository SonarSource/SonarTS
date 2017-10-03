import * as React from "react";
import SetupWidget from "./SetupWidget";
import GameWidget from "./GameWidget";
import HearthstoneJSON from "hearthstonejson";
import {InteractiveBackend, MulliganOracle, CardOracle, CardData} from "../interfaces";
import GameStateSink from "../state/GameStateSink";
import GameStateScrubber from "../state/GameStateScrubber";
import * as _ from "lodash";

const enum Widget {
	SETUP,
	GAME
}

interface DebugState {
	currentWidget?: Widget;
	cards?: CardData[];
	sink?: GameStateSink;
	scrubber?: GameStateScrubber;
	interaction?: InteractiveBackend;
	cardOracle?: CardOracle;
	mulliganOracle?: MulliganOracle;
	locale?: string;
}

export default class DebugApplication extends React.Component<void, DebugState> {

	private gameWidget: GameWidget;
	private hsjson: HearthstoneJSON;

	constructor() {
		super();
		this.state = {
			currentWidget: Widget.SETUP,
			cards: null,
			sink: null,
			interaction: null,
			scrubber: null,
			cardOracle: null,
			mulliganOracle: null,
			locale: "enUS",
		};
	}

	public componentDidMount() {
		this.loadLocale(this.state.locale);
	}

	public render(): JSX.Element {
		let widget: JSX.Element = null;
		switch (this.state.currentWidget) {
			case Widget.SETUP:
				widget = <SetupWidget defaultHostname="localhost" defaultPort={9111}
									  onSetup={this.onSetup.bind(this) } />;
				break;
			case Widget.GAME:
				widget =
					<GameWidget
						sink={this.state.sink}
						startupTime={0}
						interaction={this.state.interaction}
						scrubber={this.state.scrubber}
						exitGame={this.exitGame.bind(this) }
						cardOracle={this.state.cardOracle}
						mulliganOracle={this.state.mulliganOracle}
						assetDirectory={(asset: string) => "./assets/" + asset}
						cardArtDirectory={navigator.onLine || typeof navigator.onLine === "undefined" ? (cardId) => "https://art.hearthstonejson.com/v1/256x/" + cardId + ".jpg" : null}
						enableKeybindings={true}
						ref={this.onMountGameWidget.bind(this)}
						locale={this.state.locale}
						selectLocale={(locale: string, cb: () => void) => {
							this.loadLocale(locale, cb);
						}}
					/>;
				break;
		}

		return (
			<div className="joust">
				{widget}
				<footer>
					<p>
						Not affiliated with Blizzard. Get Hearthstone at <a
						href="battle.net/hearthstone/">Battle.net</a>.
					</p>
				</footer>
			</div>
		);
	}

	public onMountGameWidget(widget: GameWidget) {
		this.gameWidget = widget;
		if (widget && this.state.cards) {
			this.gameWidget.setCards(this.state.cards);
		}
	}

	public componentDidUpdate(prevProps: any, prevState: DebugState): void {
		if (!_.isEqual(prevState.cards, this.state.cards) && this.gameWidget) {
			this.gameWidget.setCards(this.state.cards);
		}
	}

	protected onSetup(sink: GameStateSink, interaction?: InteractiveBackend, scrubber?: GameStateScrubber, cardOracle?: CardOracle, mulliganOracle?: MulliganOracle): void {
		this.setState({
			currentWidget: Widget.GAME,
			sink: sink,
			interaction: interaction,
			scrubber: scrubber,
			cardOracle: cardOracle,
			mulliganOracle: mulliganOracle,
		});
	}

	protected loadLocale(locale: string, cb?: () => void) {
		if (!this.hsjson) {
			this.hsjson = new HearthstoneJSON();
		}
		this.setState({
			locale: locale,
		});
		this.hsjson.getLatest(locale).then((cards: CardData[]) => {
			this.setState({
				cards: cards,
			});
			cb && cb();
		});
	}

	protected exitGame() {
		this.state.sink.end();
		if (this.state.interaction) {
			this.state.interaction.exitGame();
		}
		this.setState({
			currentWidget: Widget.SETUP,
			sink: null,
			interaction: null,
			scrubber: null,
			cardOracle: null,
			mulliganOracle: null,
		});
	}
}
