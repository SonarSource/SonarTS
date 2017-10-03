import * as React from "react";
import HSReplayDecoder from "../protocol/HSReplayDecoder";
import Websocket from "websocket-stream";
import KettleDecoder from "../protocol/KettleDecoder";
import KettleEncoder from "../protocol/KettleEncoder";
import {InteractiveBackend, MulliganOracle} from "../interfaces";
import {Socket} from "net";
import FileReaderStream from "filereader-stream";
import GameStateScrubber from "../state/GameStateScrubber";
import GameStateTracker from "../state/GameStateTracker";
import GameStateSink from "../state/GameStateSink";
import {CardOracle} from "../interfaces";
import * as Stream from "stream";

interface SetupWidgetProps extends React.ClassAttributes<SetupWidget> {
	defaultHostname: string;
	defaultPort: number;
	onSetup: (sink: GameStateSink, interaction?: InteractiveBackend, scrubber?: GameStateScrubber, cardOracle?: CardOracle, mulliganOracle?: MulliganOracle) => void;
}

interface SetupWidgetState {
	working?: boolean;
	hostname?: string;
	port?: number;
	websocket?: boolean;
	secureWebsocket?: boolean;
}

export default class SetupWidget extends React.Component<SetupWidgetProps, SetupWidgetState> {
	private forceWebsocket: boolean;

	constructor(props: SetupWidgetProps) {
		super(props);
		this.state = {
			working: false,
			hostname: null,
			port: null,
			websocket: true,
			secureWebsocket: true
		}
		this.forceWebsocket = (typeof Socket === 'undefined');
	}

	public render(): JSX.Element {
		let hsreplay = <section>
			<h2>HSReplay</h2>
			<input type="file" accept="application/vnd.hearthsim-hsreplay+xml,application/xml"
				   onChange={this.onSelectFile.bind(this) } disabled={this.state.working}/>
		</section>;

		let kettle = <section>
			<h2>Kettle</h2>
			<form onSubmit={this.onSubmitKettle.bind(this) }>
				<label>Host<br /><input type="text" placeholder={this.props.defaultHostname}
										onChange={this.onChangeHostname.bind(this) } disabled={this.state.working}/></label>
				<label>Port<br /><input type="number" placeholder={'' + this.props.defaultPort}
										onChange={this.onChangePort.bind(this) }
										disabled={this.state.working}/></label>
				<label>Websocket<br /><input type="checkbox" checked={this.state.websocket || this.forceWebsocket}
											 onChange={this.onChangeWebsocket.bind(this) } disabled={this.forceWebsocket}/></label>
				<label>Secure Websocket<br /><input type="checkbox" checked={this.state.secureWebsocket && this.state.websocket}
													onChange={this.onChangeSecureWebsocket.bind(this) } disabled={!this.state.websocket}/></label>
				<button type="submit" disabled={this.state.working}>Connect</button>
			</form>
		</section>;

		return (
			<div className="setup-widget">
				{hsreplay}
			</div>
		);
	}

	protected onChangeHostname(e: any): void {
		this.setState({ hostname: e.target.value });
	}

	protected onChangePort(e: any): void {
		this.setState({ port: e.target.value });
	}

	protected onChangeWebsocket(e: any): void {
		this.setState({ websocket: e.target.checked });
	}

	protected onChangeSecureWebsocket(e: any): void {
		this.setState({ secureWebsocket: e.target.checked });
	}


	protected onSelectFile(e): void {
		let file = e.target.files[0];
		if (!file || this.state.working) {
			return;
		}
		this.setState({ working: true });
		this.loadFile(file);
	}

	protected loadFile(file: any): void {
		let filestream = FileReaderStream(file);

		/* HSReplay -> Joust */

		let scrubber = new GameStateScrubber();

		Promise.all([
			new Promise((cb) => {
				scrubber.once("ready", () => cb());
			}),
			new Promise((cb) => {
				filestream.once("end", () => cb());
			}),
		]).then(() => scrubber.play());

		let decoder = new HSReplayDecoder();
		let sink = filestream // sink is returned by the last .pipe()
			.pipe(decoder) // json -> mutators
			.pipe(new GameStateTracker()) // mutators -> latest gamestate
			.pipe(scrubber) // gamestate -> gamestate emit on scrub past
			.pipe(new GameStateSink()); // gamestate


		this.props.onSetup(sink, null, scrubber, decoder, decoder);
	}

	protected onSubmitKettle(e): void {
		e.preventDefault();
		if (this.state.working) {
			return;
		}
		this.setState({ working: true });

		let hostname = this.state.hostname || this.props.defaultHostname;
		let port = this.state.port || this.props.defaultPort;

		let socket: Stream.Duplex = null;

		if (this.state.websocket) {
			let protocol = this.state.secureWebsocket ? 'wss' : 'ws';
			socket = new Websocket(protocol + '://' + hostname + ':' + port, 'binary');
		}
		else {
			let theSocket = new Socket();
			theSocket.connect(port, hostname);
			socket = theSocket;
		}


		/* Kettle -> Joust */

		let tracker = new GameStateTracker();
		let sink = socket // sink is returned by the last .pipe()
			.pipe(new KettleDecoder()) // json -> mutators
			.pipe(tracker) // mutators -> latest gamestate
			.pipe(new GameStateSink());

		/* Joust -> Kettle */

		let interaction = new KettleEncoder(tracker);
		interaction
			.pipe(socket);

		socket.on('connect', () => {
			interaction.startGame();
			this.props.onSetup(sink, interaction);
		});

		socket.on('error', (e) => {
			console.error(e);
		});

		socket.on('close', () => {
			this.setState({ working: false });
			console.log('Connection closed');
		});
	}

}
