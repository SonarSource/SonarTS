import * as React from "react";

interface HealthProps extends React.ClassAttributes<Health> {
	health: number;
	damage: number;
	default?: number;
}

export default class Health extends React.Component<HealthProps, void> {
	public render(): JSX.Element {
		let classNames = ['health'];
		if (this.props.health !== null) {
			if (this.props.damage > 0) {
				classNames.push('negative');
			}
			else if (this.props.default !== null && this.props.health > this.props.default) {
				classNames.push('positive');
			}
		}
		return <div className={classNames.join(' ') }>{this.props.health !== null ? (this.props.health - this.props.damage) : '?'}</div>;
	}
}
