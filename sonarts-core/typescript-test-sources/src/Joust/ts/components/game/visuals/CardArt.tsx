import * as React from "react";
import * as _ from "lodash";
import {AssetDirectoryProps, CardArtDirectory} from "../../../interfaces";

interface CardArtItem {
	image: string;
	isArt?: boolean;
	classes: Array<String>;
}

interface CardArtProps extends AssetDirectoryProps, CardArtDirectory, React.ClassAttributes<CardArt> {
	layers: Array<CardArtItem>;
	scale: number;
	square: boolean;
	margin: boolean;
}

interface CardArtState {
	height?: number;
}

class CardArt extends React.Component<CardArtProps, CardArtState> {

	constructor(props: CardArtProps, context: any) {
		super(props, context);
		this.state = {
			height: 0,
		};
	}

	private onResize = () => this.measureHeight();

	public componentDidMount(): void {
		window.addEventListener("resize", this.onResize);
	}

	public componentWillUnmount(): void {
		window.removeEventListener("resize", this.onResize);
		if (this.request) {
			window.cancelAnimationFrame(this.request);
		}
	}

	public componentDidUpdate(prevProps: CardArtProps, prevState: CardArtState, prevContext: any): void {
		if (!this.state.height) {
			this.measureHeight();
		}
	}

	public shouldComponentUpdate(nextProps: CardArtProps, nextState: CardArtState): boolean {
		return (
			nextState.height !== this.state.height || !_.isEqual(nextProps.layers, this.props.layers) ||
			nextProps.scale !== this.props.scale ||
			nextProps.square !== this.props.square ||
			nextProps.margin !== this.props.margin ||
			nextProps.assetDirectory !== this.props.assetDirectory ||
			nextProps.cardArtDirectory !== this.props.cardArtDirectory
		);
	}

	private static imageDirectory: string = "images/";

	private createStyle(): any {
		// keep proportions with scale
		let width = Math.round(this.state.height * this.props.scale);
		let height = Math.round(this.state.height);
		if (this.props.square) {
			height = width;
		}
		let margin = Math.round(this.state.height * (1 - this.props.scale));
		let style = {width: width + "px", height: height + "px", marginTop: "0px"};
		if (this.props.margin) {
			style.marginTop = margin + "px";
		}
		return style;
	}

	private createImageItem(item: CardArtItem, index: number): JSX.Element {
		if (!item || (item.image === null && !item.isArt)) {
			return null;
		}

		let imgSrc = null;
		if (item.isArt) {
			if (item.image !== null && this.props.cardArtDirectory && this.props.cardArtDirectory.length > 0) {
				imgSrc = this.props.cardArtDirectory(item.image);
			}
			else {
				imgSrc = this.props.assetDirectory(CardArt.imageDirectory + "portrait.jpg");
			}
		}
		else {
			imgSrc = this.props.assetDirectory(CardArt.imageDirectory + item.image);
		}

		return (
			<img key={index}
				 src={imgSrc}
				 className={item.classes.join(" ") }
				 draggable={false}
			/>
		);
	}

	private ref: HTMLDivElement;

	protected updateRef(ref: HTMLDivElement) {
		this.ref = ref;
		if (!this.state.height) {
			// only measure if we haven't got a height yet
			// style change will trigger a new ref
			this.measureHeight();
		}
	}

	private request: number;

	protected measureHeight() {
		if (!this.ref) {
			return;
		}
		if (this.state.height) {
			if (this.request) {
				return;
			}
			this.request = window.requestAnimationFrame(() => {
				this.request = null;
				this.setState({height: 0});
			});
		}
		else {
			this.setState({height: this.ref.clientHeight});
		}
	}

	public render(): JSX.Element {
		let style = {height: "100%"};
		if (this.state.height) {
			style = this.createStyle();
		}
		return (
			<div className="visuals" style={style} ref={(ref) => this.updateRef(ref)}>
				{this.props.layers.map(this.createImageItem.bind(this))}
			</div>
		);
	}
}

export default CardArt;
