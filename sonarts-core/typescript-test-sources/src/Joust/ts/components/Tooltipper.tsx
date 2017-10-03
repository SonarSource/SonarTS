import * as bowser from "bowser";
import * as React from "react";

interface TooltipperProps extends React.ClassAttributes<Tooltipper> {
	title?: string;
	align?: "left" | "center" | "right";
	desktop?: string;
	mobile?: string;
	forceShow?: boolean;
}

interface TooltipperState {
	isHovering?: boolean;
	mobile?: boolean;
}

export default class Tooltipper extends React.Component<TooltipperProps, TooltipperState> {
	constructor(props: TooltipperProps, context: any) {
		super(props, context);
		this.state = {
			isHovering: false,
			mobile: bowser.ios || bowser.android || bowser.windowsphone,
		};
	}

	protected get mobile() {
		return this.state.mobile;
	}

	protected get desktop() {
		return !this.mobile;
	}

	protected get tooltip() {
		let tooltip = this.props.title || "";
		if (this.props.mobile && this.mobile) {
			tooltip = this.props.mobile.replace(/%s/, tooltip);
		}
		else if (this.props.desktop && this.desktop) {
			tooltip = this.props.desktop.replace(/%s/, tooltip);
		}
		return tooltip;
	}

	protected startHovering(e: any) {
		this.setState({isHovering: true});
	}

	protected stopHovering(e: any) {
		this.setState({isHovering: false});
	}

	public shouldShow() {
		return this.state.isHovering || this.props.forceShow;
	}

	public render(): JSX.Element {
		let classNames = ["joust-tooltipper-tooltip"];
		if (this.props.align) {
			classNames.push(this.props.align);
		}
		return <div className="joust-tooltipper"
					onMouseOver={(e) => {this.startHovering(e)}}
					onTouchStart={(e) => {this.startHovering(e)}}
					onMouseOut={(e) => {this.stopHovering(e)}}
					onTouchEnd={(e) => {this.stopHovering(e)}}>
			{this.shouldShow() ? <div className={classNames.join(" ")}><span>{this.tooltip}</span></div> : null}
			{this.props.children}
		</div>;
	}

}
