import * as React from "react";
import * as Immutable from "immutable";
import * as _ from "lodash";
import {CardData, EntityProps, OptionProps} from "../../interfaces";
import Attack from "./stats/Attack";
import Entity from "../../Entity";
import Health from "./stats/Health";
import Cost from "./stats/Cost";
import InHandCardArt from "./visuals/InHandCardArt";
import {CardClass, CardType, GameTag} from "../../enums";
import Durability from "./stats/Durability";

interface CardProps extends EntityProps, OptionProps, React.ClassAttributes<Card> {
	style?: any;
	isHidden?: boolean;
	defaultStats?: boolean;
	mulligan?: boolean;
	customHealth?: number;
	customAtk?: number;
	customCost?: number;
	setAside?: Immutable.Iterable<number, Entity>;
	creator?: Entity;
}

export default class Card extends React.Component<CardProps, void> {

	public shouldComponentUpdate(nextProps: CardProps, nextState: any): boolean {
		return (
			!_.isEqual(this.props.style, nextProps.style) ||
			this.props.isHidden !== nextProps.isHidden ||
			this.props.entity !== nextProps.entity ||
			this.props.damage !== nextProps.damage ||
			this.props.healing !== nextProps.healing ||
			this.props.option !== nextProps.option ||
			this.props.cards !== nextProps.cards ||
			this.props.controller !== nextProps.controller ||
			this.props.assetDirectory !== nextProps.assetDirectory ||
			this.props.cardArtDirectory !== nextProps.cardArtDirectory
		);
	}

	public render(): JSX.Element {
		let entity = this.props.entity;
		let classNames = ["card"];
		if (entity.getTag(GameTag.EVIL_GLOW)) {
			classNames.push("evil-glow");
		}
		let canBeRevealed = this.props.cards && this.props.cards.has(entity.cardId);
		if (!entity.cardId || (this.props.isHidden && !canBeRevealed)) {
			return (
				<div className={classNames.join(" ")}>
					<InHandCardArt
						hidden={true}
						entity={this.props.entity}
						assetDirectory={this.props.assetDirectory}
						cardArtDirectory={this.props.cardArtDirectory}
						mulligan={this.props.mulligan}
					/>
				</div>
			);
		}

		let draggable = this.props.option && this.props.optionCallback;
		classNames.push("revealed");
		if (this.props.option) {
			classNames.push("playable");
		}
		if (draggable) {
			classNames.push("draggable");
		}
		if (entity.getTag(GameTag.COMBO)) {
			classNames.push("combo");
		}
		if (entity.getTag(GameTag.POWERED_UP)) {
			classNames.push("powered-up");
		}
		if (
			entity.getTag(GameTag.SHIFTING) ||
			entity.getTag(GameTag.SHIFTING_MINION) ||
			entity.getTag(GameTag.SHIFTING_WEAPON)
		) {
			classNames.push("shifting");
		}
		if (entity.getTag(GameTag.CHOOSE_BOTH)) {
			classNames.push("choose-both");
		}
		if (this.props.mulligan) {
			classNames.push("mulligan");
		}

		let title = entity.cardId;
		let description = null;
		let defaultAttack = null;
		let defaultCost = null;
		let defaultHealth = null;
		let defaultDurability = null;
		let cardType = entity.getCardType();
		if (!cardType && entity.getTag(GameTag.SECRET)) {
			cardType = CardType.SPELL;
		}
		let cardClass = entity.getClass();
		if (canBeRevealed) {
			let data = this.props.cards && this.props.cards.get(entity.cardId);
			title = data.name;
			description = this.parseDescription(data);
			defaultAttack = data.attack;
			defaultCost = data.cost;
			defaultHealth = data.health;
			defaultDurability = data.durability;
			if (!cardType) {
				switch (data.type) {
					case "MINION":
						cardType = CardType.MINION;
						break;
					case "WEAPON":
						cardType = CardType.WEAPON;
						break;
					case "SPELL":
						cardType = CardType.SPELL;
						break;
					case "HERO_POWER":
						cardType = CardType.HERO_POWER;
						break;
				}
			}
			if (!cardClass) {
				switch (data.playerClass) {
					case "DRUID":
						cardClass = CardClass.DRUID;
						break;
					case "DREAM":
					case "HUNTER":
						cardClass = CardClass.HUNTER;
						break;
					case "MAGE":
						cardClass = CardClass.MAGE;
						break;
					case "PALADIN":
						cardClass = CardClass.PALADIN;
						break;
					case "PRIEST":
						cardClass = CardClass.PRIEST;
						break;
					case "ROGUE":
						cardClass = CardClass.ROGUE;
						break;
					case "SHAMAN":
						cardClass = CardClass.SHAMAN;
						break;
					case "WARLOCK":
						cardClass = CardClass.WARLOCK;
						break;
					case "WARRIOR":
						cardClass = CardClass.WARRIOR;
						break;
					default:
						cardClass = CardClass.NEUTRAL;
				}
			}
		}

		let stats = null;
		let textStyle = {color: entity.isPremium() ? "white" : "black"};

		switch (cardType) {
			case CardType.MINION: {
				classNames.push("card-minion");
				if (entity.getTag(GameTag.HIDE_STATS)) {
					break;
				}
				let attack = <Attack
					attack={this.getStatValue(GameTag.ATK, defaultAttack)}
					default={defaultAttack}
				/>;
				let health = <Health
					health={this.getStatValue(GameTag.HEALTH, defaultHealth)}
					damage={this.props.defaultStats ? 0 : entity.getDamage()}
					default={defaultHealth}
				/>;
				stats = <div className="stats">{attack}{health}</div>;
				break;
			}
			case CardType.WEAPON: {
				classNames.push("card-weapon");
				let attack = <Attack
					attack={this.getStatValue(GameTag.ATK, defaultAttack)}
					default={defaultAttack}
				/>;
				let durability = <Durability
					durability={this.getStatValue(GameTag.DURABILITY, defaultDurability)}
					damage={entity.getDamage()}
					default={defaultDurability}
				/>;
				stats = <div className="stats">{attack}{durability}</div>;
				textStyle = {color: "white"};
				break;
			}
			case CardType.SPELL:
				classNames.push("card-spell");
				break;
			case CardType.HERO_POWER:
				classNames.push("card-hero-power");
				break;
		}

		if (this.props.isHidden) {
			classNames.push("hidden-card");
		}

		return <div className={classNames.join(" ") } style={this.props.style}>
			<InHandCardArt
				entity={entity} hidden={false}
				cardType={cardType} cardClass={cardClass}
				cards={this.props.cards}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
				mulligan={this.props.mulligan}
			/>
			{entity.getTag(GameTag.HIDE_STATS) !== 0 ?
				null :
				<Cost
					cost={!this.props.isHidden && !this.props.defaultStats ? entity.getCost() : defaultCost}
					default={defaultCost}
				/>
			}
			<h1>{title}</h1>
			<div className="description">
				<p style={textStyle} dangerouslySetInnerHTML={{__html: description}}></p>
			</div>
			{stats}
			{this.props.creator ? <div className="created-by">
				{"Created by " + (this.props.cards && this.props.cards.has(this.props.creator.cardId)
					? this.props.cards.get(this.props.creator.cardId).name
					: this.props.creator.cardId)
				}
			</div> : null}
		</div>;
	}

	private getStatValue(tag: GameTag, defaultValue: number): number {
		switch (tag) {
			case GameTag.HEALTH:
				if (typeof this.props.customHealth !== "undefined") {
					return this.props.customHealth;
				}
				break;
			case GameTag.ATK:
				if (typeof this.props.customAtk !== "undefined") {
					return this.props.customAtk;
				}
				break;
			case GameTag.COST:
				if (typeof this.props.customCost !== "undefined") {
					return this.props.customCost;
				}
				break;
		}
		let value = this.props.entity.getTag(tag);
		if (this.props.defaultStats || this.props.isHidden) {
			return defaultValue;
		}
		return value;
	}

	protected parseDescription(data: CardData): string {
		if (!data || !(data.text || data.collectionText)) {
			return "";
		}

		let description = data.collectionText || data.text;

		if (data.mechanics && data.mechanics.indexOf("JADE_GOLEM") !== -1) {
			description = this.formatJadeGolemText(data.text);
		}
		else if (this.props.entity.getTag(GameTag.KAZAKUS_POTION_POWER_1)) {
			description = this.formatKazakusPotionText(data.text);
		}

		let modifier = (bonus: number, double: number) => {
			return (match: string, part1: string) => {
				let value = +part1;
				if (+bonus !== 0 || +double !== 0) {
					value += bonus;
					value *= Math.pow(2, double);
					return "*" + value + "*";
				}
				return "" + value;
			};
		};

		let damageBonus = 0;
		let damageDoubling = 0;
		let healingDoubling = 0;

		if (this.props.controller) {
			switch (this.props.entity.getCardType()) {
				case CardType.SPELL:
					damageBonus = this.props.controller.getTag(GameTag.CURRENT_SPELLPOWER);
					if (this.props.entity.getTag(GameTag.RECEIVES_DOUBLE_SPELLDAMAGE_BONUS) > 0) {
						damageBonus *= 2;
					}
					damageDoubling = this.props.controller.getTag(GameTag.SPELLPOWER_DOUBLE);
					healingDoubling = this.props.controller.getTag(GameTag.HEALING_DOUBLE);
					break;
				case CardType.HERO_POWER:
					damageBonus = this.props.controller.getTag(GameTag.CURRENT_HEROPOWER_DAMAGE_BONUS);
					damageDoubling = this.props.controller.getTag(GameTag.HERO_POWER_DOUBLE);
					healingDoubling = this.props.controller.getTag(GameTag.HERO_POWER_DOUBLE);
					break;
			}
		}

		description = description.replace(/\$(\d+)/g, modifier(damageBonus, damageDoubling));
		description = description.replace(/#(\d+)/g, modifier(0, healingDoubling));

		// custom line breaks
		if (description.match(/^\[x\]/)) {
			description = description.replace(/^\[x\]/, "");
			// enable this when font-sizing is optimized
			//description = description.replace(/\n/g, "<br>");
		}

		// remove non-breaking spaces
		description = description.replace(String.fromCharCode(160), " ");

		return description.trim();
	}

	private formatJadeGolemText(text: string): string {
		if (!this.props.controller) {
			return text;
		}
		let value = this.props.controller.getTag(GameTag.JADE_GOLEM) + 1;
		//arg1 is only used in the english localization. It's used to print "an 8/8.." instead of "a 8/8".
		let arg1 = [8, 11, 18].indexOf(value) !== -1 ? "n" : "";
		return text.replace("{0}", value + "/" + value).replace("{1}", arg1);
	}

	private formatKazakusPotionText(text: string): string {
		if (!this.props.setAside) {
			return text;
		}
		let data1 = this.props.entity.getTag(GameTag.TAG_SCRIPT_DATA_NUM_1);
		let data2 = this.props.entity.getTag(GameTag.TAG_SCRIPT_DATA_NUM_2);
		let arg1 = "";
		let arg2 = "";
		this.props.setAside.forEach(e => {
			let tagScriptData = e.getTag(GameTag.TAG_SCRIPT_DATA_NUM_1);
			if (tagScriptData) {
				if (tagScriptData === data1) {
					let data = this.props.cards.get(e.cardId);
					if (data) {
						arg1 = data.text;
					}
					if (arg2) {
						return;
					}
				}
				else if (tagScriptData === data2) {
					let data = this.props.cards.get(e.cardId);
					if (data) {
						arg2 = data.text;
					}
					if (arg1) {
						return;
					}
				}
			}
		});
		return text.replace("{0}", arg1).replace("{1}", arg2);
	}
}
