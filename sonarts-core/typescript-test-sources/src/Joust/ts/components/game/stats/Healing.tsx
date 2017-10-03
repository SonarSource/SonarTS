import * as React from "react";

interface HealingProps extends React.ClassAttributes<Healing> {
	healing:number;
}

export default class Healing extends React.Component<HealingProps, void> {

	shouldComponentUpdate(nextProps:HealingProps):boolean {
		return nextProps.healing !== this.props.healing;
	}

	public render():JSX.Element {
		return <div className="healing">{this.props.healing > 0 ? '+' + this.props.healing : ''}</div>;
	}
}
