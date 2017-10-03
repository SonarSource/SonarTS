import * as React from "react";
import {CardDataProps, CardOracleProps, CardData, EventLogItemData, LineType} from "../interfaces";
import EventLogCard from "./EventLogCard";

interface EventLogLineProps extends CardDataProps, CardOracleProps, EventLogItemData, React.ClassAttributes<EventLogLine> {
	inactive:boolean;
	first?:boolean;
}

interface EventLogLineState {
	entityData?:CardData;
	targetData?:CardData;
}

export default class EventLogLine extends React.Component<EventLogLineProps, EventLogLineState> {

	constructor(props:EventLogLineProps) {
		super(props);
		this.state = {
			entityData: this.lookupEntity(this.props.entityId),
			targetData: this.lookupEntity(this.props.targetId)
		}
	}

	public shouldComponentUpdate(nextProps:EventLogLineProps) {
		let hasEntity = nextProps.entityId || nextProps.targetId;
		return (
			this.props.inactive !== nextProps.inactive ||
			(this.props.cards !== nextProps.cards && hasEntity) ||
			(this.props.cardOracle !== nextProps.cardOracle && hasEntity) ||
			this.props.type !== nextProps.type ||
			this.props.time !== nextProps.time ||
			this.props.entityId !== nextProps.entityId ||
			this.props.targetId !== nextProps.targetId ||
			this.props.player !== nextProps.player ||
			this.props.data !== nextProps.data ||
			this.props.data2 !== nextProps.data2 ||
			this.props.indent !== nextProps.indent
		);
	}

	public componentWillReceiveProps(nextProps:EventLogLineProps):void {
		let changes = {} as EventLogLineState;
		if (this.props.entityId !== nextProps.entityId) {
			changes.entityData = this.lookupEntity(nextProps.entityId);
		}
		if (this.props.targetId !== nextProps.targetId) {
			changes.targetData = this.lookupEntity(nextProps.targetId);
		}
		this.setState(changes);
	}

	public render():JSX.Element {
		let characters = '';
		let classNames = ['line'];

		if (this.props.inactive) {
			classNames.push('inactive');
		}
		if (this.props.type == LineType.Turn) {
			classNames.push('header');
			if (!this.props.first) {
				characters += '\r\n';
			}
			characters += '# ';
		}
		else if (this.indent()) {
			classNames.push('indent');
			characters += '\t';
		}

		let entity = <EventLogCard
			key="entity"
			cards={this.props.cards}
			cardId={this.props.cardOracle && this.props.cardOracle.get(this.props.entityId)}
		/>;
		let target = <EventLogCard
			key="target"
			cards={this.props.cards}
			cardId={this.props.cardOracle && this.props.cardOracle.get(this.props.targetId)}
		/>;

		let strings = {
			'player': this.props.player,
			'entity': entity,
			'target': target,
			'source': target,
			'data': this.props.data,
		} as any;

		let words = this.parseLine(strings).split(' ');
		let parts = words.map((word) => {
			let parts = word.match(/^(.*)%(\w+)%(.*)$/);
			if (parts === null) {
				return word;
			}
			let key = parts[2];
			if (typeof strings[key] !== 'undefined') {
				if (typeof strings[key] !== 'object') {
					return parts[1] + strings[key] + parts[3];
				}
				else {
					return strings[key];
				}
			}
			return word;
		}).map((word, i) => typeof word !== 'object' ? (i > 0 ? ' ' : '') + word + ' ' : word);

		return (
			<div className={classNames.join(' ')}>
				{characters ? <pre>{characters}</pre> : null}{parts}
			</div>
		);
	}

	private indent():boolean {
		switch (this.props.type) {
			case LineType.Draw:
			case LineType.DiscardFromDeck:
			case LineType.Damage:
			case LineType.Get:
				return this.props.indent;
			case LineType.Turn:
			case LineType.Play:
			case LineType.Attack:
			case LineType.Concede:
			case LineType.Win:
			case LineType.TurnEnd:
			case LineType.Mulligan:
				return false;
		}
		return true;
	}

	private parseLine(strings:any):string {
		switch (this.props.type) {
			case LineType.Turn:
				return this.props.data == -1 ? "Mulligan" : "Turn %data%: %player%";
			case LineType.Win:
				return "%player% wins!";
			case LineType.Concede:
				return "%player% concedes";
			case LineType.Draw:
				return this.state.targetData ? "%player% draws %entity% from %source%" : "%player% draws %entity%";
			case LineType.Summon:
				return this.state.entityData && this.state.entityData.type === 'WEAPON' ? "%source% creates %entity%" : "%source% summons %entity%";
			case LineType.Replace:
				return "%entity% replaces %target%";
			case LineType.ArmorBuff:
				return this.state.targetData ? "%entity% gains %data% armor from %source%" : "%entity% gains %data% armor";
			case LineType.AttackBuff:
				return this.state.targetData ? "%entity% gains +%data% attack from %source%" : "%entity% gains +%data% attack";
			case LineType.HealthBuff:
				return this.state.targetData ? "%entity% gains +%data% health" : "%entity% gains +%data% health from %source%";
			case LineType.AttackReduce:
				return "%source% sets %entity%'s attack to %data%";
			case LineType.HealthReduce:
				return "%source% sets %entity%'s health to %data%";
			case LineType.Attack:
				return this.props.data ? "%entity% attacks %target% for %data%" : "%entity% attacks %target%";
			case LineType.Death:
				return this.state.entityData && this.state.entityData.type === 'WEAPON' ? "%entity% breaks" : "%entity% dies";
			case LineType.Discard:
				return "%player% discards %entity%";
			case LineType.DiscardFromDeck:
				return "%player% discards %entity% from their deck";
			case LineType.Get:
				return this.state.targetData ? "%player% receives %entity% from %source%" : "%player% receives %entity%";
			case LineType.GetToDeck:
				return this.state.targetData ? "%entity% from %source% is added to %player%'s deck" : "%entity% is added to %player%'s deck";
			case LineType.Trigger:
				return "%entity% triggers";
			case LineType.Damage:
				return this.state.targetData && this.state.targetData.type == "WEAPON" ?
					(this.state.entityData ? "%target% loses %data% durability from %entity%" : "%target% loses %data% durability")
					: (this.props.data ? "%entity% damages %target% for %data%" : "%entity% hits %target%");
			case LineType.Healing:
				return "%entity% heals %target% for %data%";
			case LineType.Remove:
				return this.state.targetData ? "%source% removes %entity%" : "%entity% is removed";
			case LineType.Mulligan:
				return "%player% mulligans %entity%";
			case LineType.Silenced:
				return this.state.targetData ? "%entity% is silenced by %source%" : "%entity% is silenced";
			case LineType.Frozen:
				return this.props.data ? (this.state.targetData ? "%source% freezes %entity%" : "%entity% gets frozen") : "%entity% is no longer frozen";
			case LineType.Steal:
				return this.state.targetData ? "%player% steals %entity% using %source%" : "%player% steals %entity%";
			case LineType.DeckToPlay:
				return "%source% brings %entity% into play";
			case LineType.PlayToDeck:
				return "%source% returns %entity% to %player%'s deck";
			case LineType.PlayToHand:
				return "%source% returns %entity% to %player%'s hand";
			case LineType.Weapon:
				return "%entity% equips %target%";
			case LineType.TurnEnd:
				return "%player% ends their turn";
			case LineType.DivineShield:
			case LineType.Charge:
			case LineType.Taunt:
			case LineType.Windfury:
			case LineType.Stealth:
			case LineType.CantBeDamaged:
				strings['status'] = this.getStatusKeyword();
				return this.props.data ? (this.state.targetData ? "%entity% gains %status% from %source%" : "%entity% gains %status%") : "%entity% loses %status%";
			case LineType.Cthun:
				strings['stats'] = this.props.data + '/' + this.props.data2;
				return "%entity% gets buffed to %stats%";
			case LineType.Play:
				const HERO_POWER = 'HERO_POWER';
				return this.state.targetData ? (this.state.entityData && this.state.entityData.type === HERO_POWER ? "%player% uses %entity% targeting %target%" : "%player% plays %entity% targeting %target%")
					: this.state.entityData && this.state.entityData.type === HERO_POWER ? "%player% uses %entity%" : "%player% plays %entity%";
			case LineType.StatsBuff:
				strings['stats'] = '+' + this.props.data + '/+' + this.props.data2;
				return this.state.targetData ? "%entity% gains %stats% from %target%" : "%entity% gains %stats%";
		}
	}

	private getStatusKeyword():string {
		switch (this.props.type) {
			case LineType.DivineShield:
				return 'Divine Shield';
			case LineType.Charge:
				return 'Charge';
			case LineType.Taunt:
				return 'Taunt';
			case LineType.Windfury:
				return 'Windfury';
			case LineType.Stealth:
				return 'Stealth';
			case LineType.CantBeDamaged:
				return 'Immunity';
		}
	}

	private lookupEntity(id:number):CardData {
		if (!id || !this.props.cardOracle || !this.props.cards) {
			return;
		}
		let cardId = this.props.cardOracle.get(id);
		return this.props.cards.get(cardId);
	}
}
