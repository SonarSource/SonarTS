import * as React from "react";
import * as _ from "lodash";

interface SpeedSelectorProps extends React.ClassAttributes<SpeedSelector> {
	speed: number;
	speeds: number[];
	selectSpeed: (speed: number) => void;
	disabled?: boolean;
}

export default class SpeedSelector extends React.Component<SpeedSelectorProps, void> {

	protected changeSpeed(e): void {
		this.props.selectSpeed(+e.target.value);
	}

	public shouldComponentUpdate(nextProps: SpeedSelectorProps, nextState: any): boolean {
		return nextProps.speed !== this.props.speed ||
			_.isEqual(nextProps.speeds, this.props.speed) ||
			nextProps.selectSpeed !== this.props.selectSpeed ||
			nextProps.disabled !== this.props.disabled
	}

	public render(): JSX.Element {
		let speeds = this.props.speeds.map((val) => {
			return <option key={val} value={'' + val}>{val}&times; </option>;
		});

		return (
			<select onChange={(e) => this.changeSpeed(e)} value={'' + this.props.speed}
				disabled={this.props.disabled}>
				{speeds}
			</select>
		);

	}
}
