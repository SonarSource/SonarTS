import * as React from "react";
import {StreamScrubber, KeybindingProps, LocaleProps} from "../interfaces";
import Timeline from "./Timeline";
import SpeedSelector from "./SpeedSelector";
import Tooltipper from "./Tooltipper";
import {cookie} from "cookie_js";
import * as _ from "lodash";
import Settings from "./Settings";

interface ScrubberProps extends KeybindingProps, LocaleProps, React.ClassAttributes<Scrubber> {
	scrubber: StreamScrubber;
	swapPlayers?: () => void;
	isSwapped?: boolean;
	isFullscreen?: boolean;
	isFullscreenAvailable?: boolean;
	fullscreenError?: boolean;
	onClickFullscreen?: () => void;
	onClickMinimize?: () => void;
	isRevealingCards?: boolean;
	canRevealCards?: boolean;
	onClickHideCards?: () => void;
	onClickRevealCards?: () => void;
	isLogVisible?: boolean;
	toggleLog?: () => void;
	onSelectLocale?: (locale: string, loaded?: () => void) => void;
}

interface ScrubberState {
	playing?: boolean;
	canInteract?: boolean;
	canRewind?: boolean;
	canPlay?: boolean;
	speed?: number;
	duration?: number;
	currentTime?: number;
	isShowingSettings?: boolean;
}

export default class Scrubber extends React.Component<ScrubberProps, ScrubberState> {

	private static SPEEDS = [0.75, 1, 1.5, 2, 3, 4, 8];

	constructor(props: ScrubberProps) {
		super(props);

		// restore speed setting
		let speed = +cookie.get("joust_speed", "1");
		if (Scrubber.SPEEDS.indexOf(speed) === -1) {
			speed = 1;
		}

		this.state = {
			playing: false,
			canInteract: false,
			canRewind: false,
			canPlay: false,
			speed: speed,
			isShowingSettings: false,
		};
		this.props.scrubber.setSpeed(this.state.speed);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	public componentDidMount(): void {
		this.registerListeners(this.props);
	}

	public componentWillUpdate(nextProps: ScrubberProps, nextState: ScrubberState): void {
		if (!_.isEqual(nextProps, this.props)) {
			this.removeListeners(this.props);
		}
	}

	public componentDidUpdate(prevProps: ScrubberProps, prevState: ScrubberState, prevContext: any): void {
		if (!_.isEqual(prevProps, this.props)) {
			this.registerListeners(this.props);
		}
	}

	public shouldComponentUpdate(nextProps: ScrubberProps, nextState: ScrubberState, nextContext: any): boolean {
		if (_.isEqual(nextState, this.state) &&
			nextProps.isSwapped === this.props.isSwapped &&
			nextProps.isFullscreen === this.props.isFullscreen &&
			nextProps.isFullscreenAvailable === this.props.isFullscreenAvailable &&
			nextProps.fullscreenError === this.props.fullscreenError &&
			nextProps.isRevealingCards === this.props.isRevealingCards &&
			nextProps.canRevealCards === this.props.canRevealCards &&
			nextProps.isLogVisible === this.props.isLogVisible &&
			nextProps.locale === this.props.locale
		) {
			return false;
		}
		return true;
	}

	private updateListener = () => this.updateState();

	private registerListeners(props: ScrubberProps): void {
		props.scrubber.on("update", this.updateListener);
		if (props.enableKeybindings) {
			document.addEventListener("keydown", this.onKeyDown);
		}
	}

	private removeListeners(props: ScrubberProps): void {
		props.scrubber.removeListener("update", this.updateListener);
		if (props.enableKeybindings) {
			document.removeEventListener("keydown", this.onKeyDown);
		}
	}

	private onKeyDown(e: KeyboardEvent): void {
		if (!this.state.canInteract) {
			return;
		}

		if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
			// do not trigger with modifier
			return;
		}

		let activeTag = document.activeElement && document.activeElement.tagName;
		if (activeTag == "TEXTAREA" || activeTag == "INPUT" || activeTag == "SELECT") {
			// Do not trigger if an input element is focused
			return;
		}

		let preventDefault = true;

		switch (e.keyCode) {
			case 32: // spacebar
			case 75: // k
				this.props.scrubber.toggle();
				break;
			case 37: // left arrow
			case 74: // j
				this.props.scrubber.skipBack();
				break;
			case 39: // right arrow
			case 76: // l
				this.props.scrubber.nextTurn();
				break;
			case 38: // up arrow
				this.props.scrubber.previousAction();
				break;
			case 40: // down arrow
				this.props.scrubber.nextAction();
				break;
			case 36: // home
				this.props.scrubber.rewind();
				break;
			case 35: // end
				this.props.scrubber.fastForward();
				break;
			case 88: // x
				if (!this.props.canRevealCards) {
					return;
				}
				if (this.props.isRevealingCards) {
					this.props.onClickHideCards && this.props.onClickHideCards();
				}
				else {
					this.props.onClickRevealCards && this.props.onClickRevealCards();
				}
				break;
			case 87: // w
			case 187: // +
			{
				let index = Scrubber.SPEEDS.indexOf(this.state.speed) + 1;
				if (Scrubber.SPEEDS[index]) {
					this.selectSpeed(Scrubber.SPEEDS[index]);
				}
			}
				break;
			case 83: // s
			case 189: // -
			{
				let index = Scrubber.SPEEDS.indexOf(this.state.speed) - 1;
				if (Scrubber.SPEEDS[index]) {
					this.selectSpeed(Scrubber.SPEEDS[index]);
				}
			}
				break;
			case 67: // c
				this.props.swapPlayers();
				break;
			case 70: // f
				if (!this.props.isFullscreenAvailable) {
					return;
				}
				if (this.props.isFullscreen) {
					this.props.onClickMinimize();
				}
				else {
					this.props.onClickFullscreen();
				}
				break;
			default:
				preventDefault = false;
				break;
		}

		if (preventDefault) {
			e.preventDefault();
		}
	}

	protected updateState(): void {
		const scrubber = this.props.scrubber;
		this.setState({
			playing: scrubber.isPlaying(),
			canInteract: scrubber.canInteract(),
			canPlay: scrubber.canPlay(),
			canRewind: scrubber.canRewind(),
			speed: scrubber.getSpeed(),
			duration: scrubber.getDuration(),
			currentTime: scrubber.getCurrentTime(),
		});
	}

	public componentWillUnmount(): void {
		this.removeListeners(this.props);
	}

	public render(): JSX.Element {
		const playpause = this.state.playing ?
			<Tooltipper title="Pause" align="left">
				<button onClick={() => this.pause()} disabled={!this.state.canInteract}
						className="joust-scrubber-button-wide"><i className="joust-fa joust-fa-pause"></i></button>
			</Tooltipper> :
			<Tooltipper title="Play" align="left">
				<button onClick={() => this.play()} disabled={!this.state.canPlay}
						className="joust-scrubber-button-wide"><i className="joust-fa joust-fa-play"></i></button>
			</Tooltipper>;

		const restart = <Tooltipper title="Restart" align="left">
			<button onClick={() => this.rewind()} disabled={!this.state.canRewind}
					className="joust-scrubber-button-wide"><i className="joust-fa joust-fa-fast-backward"></i></button>
		</Tooltipper>;

		const speedSelector = <Tooltipper title="Playback speed" desktop="%s (W/S)">
			<SpeedSelector
				speed={this.state.speed}
				speeds={Scrubber.SPEEDS}
				selectSpeed={(speed: number) => this.selectSpeed(speed)}
				disabled={!this.state.canInteract}
			/>
		</Tooltipper>;

		const fullscreenToggle = this.props.isFullscreen ?
			<Tooltipper title="Restore" align="right" desktop="%s (F)">
				<button onClick={this.props.onClickMinimize}><i className="joust-fa joust-fa-window-restore"></i>
				</button>
			</Tooltipper> :
			<Tooltipper
				title={this.props.fullscreenError ? "Error entering fullscreen." : "Fullscreen"}
				align="right"
				forceShow={this.props.fullscreenError}
				desktop={!this.props.fullscreenError ? "%s (F)" : null}
			>
				<button
					onClick={() => this.props.isFullscreenAvailable && this.props.onClickFullscreen()}
					disabled={!this.props.isFullscreenAvailable}
				>
					<i className="joust-fa joust-fa-arrows-alt"></i>
				</button>
			</Tooltipper>;

		const revealToggle = this.props.isRevealingCards ?
			<Tooltipper title="Hide cards" desktop="%s (X)">
				<button onClick={this.props.onClickHideCards}><i className="joust-fa joust-fa-eye-slash"></i></button>
			</Tooltipper> :
			<Tooltipper title="Reveal cards" desktop="%s (X)">
				<button onClick={this.props.onClickRevealCards} disabled={!this.props.canRevealCards}>
					<i className="joust-fa joust-fa-eye"></i>
				</button>
			</Tooltipper>;

		const swapToggle = <Tooltipper title="Swap players" desktop="%s (C)">
			<button onClick={this.props.swapPlayers} disabled={!this.state.canInteract}><i
				className="joust-fa joust-fa-unsorted"></i></button>
		</Tooltipper>;

		const log = <Tooltipper title={this.props.isLogVisible ? "Hide event log" : "Show event log"}>
			<button onClick={this.props.toggleLog} disabled={!this.state.canInteract}><i
				className="joust-fa joust-fa-bars"></i></button>
		</Tooltipper>;

		const settingsToggleButton = <button
			onClick={() => this.setState({isShowingSettings: !this.state.isShowingSettings})}>
			<i className="joust-fa joust-fa-cog"></i>
		</button>;

		const settingsToggle = !this.state.isShowingSettings ? <Tooltipper title={"Settings"}>
			{settingsToggleButton}
		</Tooltipper> : settingsToggleButton;

		return (
			<div className="joust-scrubber">
				{this.state.canRewind && !this.state.canPlay ? restart : playpause}
				{speedSelector}
				<Timeline
					duration={this.state.duration }
					at={this.state.currentTime }
					seek={this.props.scrubber.seek.bind(this.props.scrubber) }
					turnMap={this.props.scrubber.getHistory().turnMap}
					swapPlayers={this.props.isSwapped}
					disabled={!this.state.canInteract}
					ref={(inhibitor) => this.props.scrubber.setInhibitor(inhibitor) }
				/>
				{revealToggle}
				{swapToggle}
				{this.state.isShowingSettings && <Settings
					locale={this.props.locale}
					onSelectLocale={this.props.onSelectLocale && ((locale: string, loaded: () => void) => this.selectLocale(locale, loaded))}
					isLogVisible={this.props.isLogVisible}
					onToggleLog={() => this.props.toggleLog()}
					onClose={() => this.setState({isShowingSettings: false})}
				/>}
				{settingsToggle}
				{fullscreenToggle}
			</div>
		);
	}

	protected play(): void {
		this.props.scrubber.play();
	}

	protected pause(): void {
		this.props.scrubber.pausePlayback();
	}

	protected rewind(): void {
		let play = false;
		if (this.props.scrubber.hasEnded()) {
			play = true;
		}
		this.props.scrubber.rewind();
		if (play) {
			this.props.scrubber.play();
		}
	}

	protected selectSpeed(speed: number): void {
		speed = Math.max(speed, 0);
		cookie.set("joust_speed", "" + speed, {
			expires: 365, // one year
			path: "/",
		});
		this.props.scrubber.setSpeed(speed);
	}

	protected selectLocale(locale: string, loaded: () => void): void {
		cookie.set("joust_locale", locale, {
			expires: 365, // one year
			path: "/",
		});
		this.props.onSelectLocale(locale, loaded);
	}
}
