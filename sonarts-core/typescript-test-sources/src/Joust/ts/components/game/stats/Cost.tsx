import * as React from "react";

interface CostProps extends React.ClassAttributes<Cost> {
	cost: number;
	default?: number;
}

export default class Cost extends React.Component<CostProps, void> {
	public render(): JSX.Element {
		let classNames = ['cost'];
		if (this.props.default !== null && this.props.cost !== null) {
			if (this.props.cost < this.props.default) {
				classNames.push('positive');
			}
			else if (this.props.cost > this.props.default) {
				classNames.push('negative');
			}
		}
		return <div className={classNames.join(' ') }>{this.props.cost !== null ? this.props.cost : '?'}</div>;
	}
}
