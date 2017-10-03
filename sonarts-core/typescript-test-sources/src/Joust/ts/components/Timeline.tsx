import * as React from "react";
import * as Immutable from "immutable";
import {StreamScrubberInhibitor} from "../interfaces";
import GameState from "../state/GameState";
import Turn from "./Turn";

interface TimelineProps extends React.ClassAttributes<Timeline> {
	at: number;
	duration: number;
	seek: (time: number) => void;
	turnMap?: Immutable.Map<number, GameState>;
	disabled?: boolean;
	swapPlayers?: boolean;
}

interface TimelineState {
	isDragging?: boolean;
}

export default class Timeline extends React.Component<TimelineProps, TimelineState> implements StreamScrubberInhibitor {
	private ref: HTMLDivElement;
	private mouseMove: (e) => void;
	private mouseUp: (e) => void;
	private touchMove: (e) => void;
	private touchEnd: (e) => void;

	constructor(props: TimelineProps) {
		super(props);
		this.state = {
			isDragging: false
		};
		this.mouseMove = this.onMouseMove.bind(this);
		this.mouseUp = this.onMouseUp.bind(this);
		this.touchMove = this.onTouchMove.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener('mousemove', this.mouseMove);
		document.addEventListener('mouseup', this.mouseUp);
		document.addEventListener('touchmove', this.touchMove);
		document.addEventListener('touchend', this.mouseUp);
		document.addEventListener('touchcancel', this.mouseUp);
	}

	public componentWillUnmount(): void {
		document.removeEventListener('mousemove', this.mouseMove);
		document.removeEventListener('mouseup', this.mouseUp);
		document.removeEventListener('touchmove', this.touchMove);
		document.removeEventListener('touchend', this.mouseUp);
		document.removeEventListener('touchcancel', this.mouseUp);
	}

	protected onMouseDown(e): void {
		if (e.button !== 0 || this.props.disabled) {
			// any button other than left click
			return;
		}
		e.preventDefault();
		this.setState({isDragging: true});
		this.seek(e.clientX);
	}

	protected onMouseMove(e): void {
		if (!this.state.isDragging) {
			return;
		}

		if (!e.buttons) {
			this.setState({isDragging: false});
			return;
		}

		this.seek(e.clientX);
	}

	protected onMouseUp(e): void {
		this.setState({isDragging: false});
	}

	protected onTouchStart(e): void {
		if (!e.touches[0] || this.props.disabled) {
			return;
		}
		e.preventDefault();
		let touch = e.touches[0];
		this.setState({isDragging: true});
		this.seek(touch.clientX);
	}

	protected onTouchMove(e): void {
		if (!this.state.isDragging || this.props.disabled) {
			return;
		}

		if (!e.touches[0]) {
			return;
		}

		e.preventDefault();
		let touch = e.touches[0];
		this.seek(touch.clientX);
	}

	protected seek(x: number): void {
		const rect = this.ref.getBoundingClientRect();
		let offset = Math.min(Math.max(rect.left, x), rect.right);

		const width = rect.right - rect.left;
		offset = offset - rect.left;

		const seek = this.props.duration / width * offset;
		this.props.seek(seek);
	}

	public render(): JSX.Element {
		const mulliganTurn = this.props.turnMap.get(1);
		const mulligan = mulliganTurn && mulliganTurn.time > 0 ?
			<Turn
				key={0}
				mulligan={true}
				duration={mulliganTurn.time}
				totalDuration={this.props.duration}
			/> : null;

		const turns = this.props.turnMap.map((
			current: GameState, turn: number,
			map: Immutable.Map<number, GameState>
		): JSX.Element => {
			let duration = 0;
			let i = 1;
			while (!map.has(turn + i) && turn + i < map.count()) {
				i++;
			}

			if (map.has(turn + i)) {
				let next = map.get(turn + i);
				duration = next.time - current.time;
			}
			else {
				duration = this.props.duration - current.time;
			}

			return <Turn
				key={turn}
				state={current}
				invert={this.props.swapPlayers}
				duration={duration}
				totalDuration={this.props.duration}
				turnNumber={turn}
			/>;
		}).toArray();

		const width = 100 / this.props.duration * this.props.at;

		const classes = ['joust-scrubber-timeline'];

		if (!turns.length) {
			classes.push('no-turns');
		}

		if (this.props.disabled) {
			classes.push("disabled");
		} else if (this.state.isDragging) {
			classes.push("dragging");
		}

		return (
			<div
				className={classes.join(' ')}
				ref={(ref) => this.ref = ref}
				onMouseDown={this.onMouseDown.bind(this) }
				onTouchStart={this.onTouchStart.bind(this) }
			>
				<div className="joust-scrubber-progress" style={{ width: width + '%' }}></div>
				{mulligan}
				{turns}
			</div>
		);
	}

	public isInhibiting(): boolean {
		return this.state.isDragging;
	}
}
