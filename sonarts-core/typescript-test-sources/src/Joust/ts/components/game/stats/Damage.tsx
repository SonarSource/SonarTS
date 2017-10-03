import * as React from "react";

interface DamageProps extends React.ClassAttributes<Damage> {
	damage:number;
}

export default class Damage extends React.Component<DamageProps, void> {

	shouldComponentUpdate(nextProps:DamageProps):boolean {
		return nextProps.damage !== this.props.damage;
	}

	public render():JSX.Element {
		return <div className="damage">{this.props.damage > 0 ? -this.props.damage : ''}</div>;
	}
}
