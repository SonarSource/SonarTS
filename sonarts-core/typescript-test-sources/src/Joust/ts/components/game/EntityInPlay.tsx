import * as React from "react";
import {EntityInPlayProps, EntityInPlayState} from "../../interfaces";
import {BlockType, MetaDataType} from "../../enums";
import GameStateDescriptor from "../../state/GameStateDescriptor";
import MetaData from "../../MetaData";

abstract class EntityInPlay<P extends EntityInPlayProps> extends React.Component<P, EntityInPlayState> {

	private baseClassName: string = '';

	protected abstract jsx();

	constructor(baseClassName: string) {
		super();
		this.baseClassName = baseClassName;
		this.state = {
			isHovering: false
		}
	}

	protected playWithClick(): boolean {
		return false;
	}

	protected getClassNames(): string[] {
		let classNames = ['entity', 'in-play'];
		classNames.push(this.baseClassName);
		if (this.props.isTarget) {
			classNames.push('target');
		}
		else if (this.props.option) {
			classNames.push('playable');
		}
		if (this.props.entity) {
			if (this.props.entity.isExhausted()) {
				classNames.push('exhausted');
			}
			if (this.props.entity.isStealthed()) {
				classNames.push('stealth');
			}
			if (this.props.entity.isDivineShielded()) {
				classNames.push('divine-shield');
			}
			if (this.props.entity.isTaunter()) {
				classNames.push('taunt');
			}
			if (this.props.entity.isFrozen()) {
				classNames.push('frozen');
			}

			if (this.props.descriptors) {
				let spellTarget = false;
				this.props.descriptors.forEach((descriptor:GameStateDescriptor) => {
					switch (descriptor.type) {
						case BlockType.ATTACK:
							if (this.props.entity.id == descriptor.entityId) {
								classNames.push('attacking')
							}
							else if (this.props.entity.id == descriptor.target) {
								classNames.push('defending')
							}
							break;
						case BlockType.POWER:
							if (descriptor.target == this.props.entity.id) {
								spellTarget = true;
							}
							break;
						case BlockType.TRIGGER:
							if (descriptor.entityId == this.props.entity.id) {
								classNames.push('triggered');
							}
							break;
					}
					descriptor.metaData.forEach((metadata:MetaData) => {
						if (metadata.type === MetaDataType.TARGET) {
							if (metadata.entities.contains(this.props.entity.id)) {
								spellTarget = true;
							}
						}
					});
				});
				if (spellTarget) {
					classNames.push('spellTarget');
				}
			}
		}
		if (this.state.isHovering) {
			classNames.push('hovering');
		}
		return classNames;
	}

	public click(e) {
		e.preventDefault();
		this.props.optionCallback(this.props.option);
	}

	protected startHovering(e) {
		this.setState({isHovering: true});
	}

	protected stopHovering(e) {
		this.setState({isHovering: false});
	}

	public render(): JSX.Element {
		if (!this.props.entity) {
			return <div className={this.getClassNames().concat(['no-entity']).join(' ') }></div>;
		}

		let playable = !!this.props.option;
		let requiresTarget = this.props.option && this.props.option.hasTargets();

		let jsx = null;
		/*if (playable && !requiresTarget && this.playWithClick()) {
			jsx = <div className={this.getClassNames().join(' ') }
					   onClick={(playable && this.props.optionCallback) ? this.click.bind(this) : null}>
				{this.jsx()}
			</div>;
		}
		else {
			jsx = <div className={this.getClassNames().join(' ') }>{this.jsx() }</div>;
			if (playable && this.props.optionCallback) {
				// make draggable
				jsx = this.props.connectDragSource(jsx);
			}
		}*/

		// make drop target
		//jsx = this.props.connectDropTarget(jsx);*/



		return <div className={this.getClassNames().join(' ') }
					onMouseOver={(e) => {this.startHovering(e)}}
					onTouchStart={(e) => {this.startHovering(e)}}
					onMouseOut={(e) => {this.stopHovering(e)}}
					onTouchEnd={(e) => {this.stopHovering(e)}}
				>
			{this.jsx()}
		</div>;
	}
}

export default EntityInPlay;
