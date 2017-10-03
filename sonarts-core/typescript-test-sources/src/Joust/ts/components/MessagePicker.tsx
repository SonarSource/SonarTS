import * as React from "react";

interface MessagePickerProps extends React.ClassAttributes<MessagePicker> {
	messages: string[];
	interval: number;
	random?: boolean;
}

interface MessagePickerState {
	message?: number;
	sequence?: number[];
}

export default class MessagePicker extends React.Component<MessagePickerProps, MessagePickerState> {

	private interval: number;

	public constructor(props: MessagePickerProps) {
		super(props);
		this.state = {
			message: 0,
			sequence: this.generateSequence()
		};
	}

	public componentDidMount(): void {
		this.scheduleUpdates();
	}

	public componentWillReceiveProps(nextProps: MessagePickerProps): void {
		if(nextProps.messages.length != this.props.messages.length) {
			clearInterval(this.interval);
			this.setState({message: 0, sequence: this.generateSequence()});
			this.scheduleUpdates();
		}
	}

	public componentWillUnmount():void {
		if(this.interval) {
			clearInterval(this.interval);
		}
	}

	private scheduleUpdates() {
		this.interval = setInterval(this.cycleMessage.bind(this), this.props.interval * 1000);
	}

	public render(): JSX.Element {
		let message = this.props.messages[this.state.sequence[this.state.message]];
		message = message.replace('...', String.fromCharCode(8230)); // &hellip;
		return <span>{message}</span>;
	}

	private generateSequence(): number[] {
		let sequence = [];
		let length = this.props.messages.length;
		for (let i = 0; i < length; i++) {
			sequence[i] = i;
		}
		if (this.props.random !== false) {
			// Knuth shuffle
			for (let i = 0; i < length - 1; i++) {
				let j = Math.floor(i + Math.floor(Math.random() * (length - i)));
				[sequence[i], sequence[j]] = [sequence[j], sequence[i]];
			}
		}
		return sequence;
	}

	private cycleMessage(): void {
		this.setState({message: (this.state.message + 1) % this.props.messages.length});
	}
}
