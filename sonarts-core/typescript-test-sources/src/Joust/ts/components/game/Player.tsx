import * as React from "react";
import * as Immutable from "immutable";
import PlayerEntity from "../../Player";
import Entity from "../../Entity";
import Option from "../../Option";
import Choice from "../../Choice";
import ChoiceList from "../../Choices";
import Deck from "./Deck";
import Hand from "./Hand";
import Hero from "./Hero";
import HeroPower from "./HeroPower";
import Field from "./Field";
import Weapon from "./Weapon";
import Choices from "./Choices";
import Rank from "./Rank";
import Card from "./Card";
import Minion from "./Minion";
import {Zone, CardType, GameTag, ChoiceType, Mulligan, PlayState, BlockType} from "../../enums";
import {
	OptionCallbackProps,
	CardDataProps,
	CardOracleProps,
	AssetDirectoryProps,
	CardArtDirectory,
	GameStateDescriptorStackProps,
	HideCardsProps,
	MulliganOracleProps
} from "../../interfaces";
import GameStateDescriptor from "../../state/GameStateDescriptor";

interface PlayerProps extends OptionCallbackProps, CardDataProps, CardOracleProps, MulliganOracleProps, AssetDirectoryProps,
	CardArtDirectory,GameStateDescriptorStackProps, HideCardsProps, React.ClassAttributes<Player> {
	player: PlayerEntity;
	entities: Immutable.Map<number, Immutable.Map<number, Entity>>;
	options: Immutable.Map<number, Immutable.Map<number, Option>>;
	choices: ChoiceList;
	isTop: boolean;
	isCurrent: boolean;
}

export default class Player extends React.Component<PlayerProps, void> {

	public render(): JSX.Element {
		let filterByCardType = (cardType: number) => {
			return (entity: Entity) => {
				return !!entity && entity.getCardType() === cardType;
			};
		};

		let activatedHeroPower = false;


		const emptyEntities = Immutable.Map<number, Entity>();
		const emptyOptions = Immutable.Map<number, Option>();

		const setAside = this.props.entities.get(Zone.SETASIDE) || emptyEntities;

		let action = null;
		if (this.props.descriptors.count() > 0 && !this.props.choices) {
			this.props.descriptors.forEach((descriptor: GameStateDescriptor, index: number) => {
				let outer = this.props.descriptors.get(index + 1);
				let type = descriptor.type;
				if (type === BlockType.PLAY || type === BlockType.TRIGGER || type === BlockType.RITUAL) {
					let entity: Entity|null = null;
					// search for entity
					this.props.entities.forEach((map: Immutable.Map<number, Entity>) => {
						map.forEach((toCompare: Entity) => {
							if (descriptor.entityId === toCompare.id) {
								if (type === BlockType.PLAY || toCompare.getTag(GameTag.SECRET) || toCompare.getTag(GameTag.EVIL_GLOW)) {
									entity = toCompare;
								}
								else if (type === BlockType.TRIGGER && toCompare.cardId === "KAR_096" && toCompare.getTag(GameTag.REVEALED)) {
									//Prince Malchezaar
									entity = toCompare;
								}
								else if (type === BlockType.RITUAL) {
									// search for ritual minion ("...give your C'Thun...")
									entity = toCompare;
								}
							}
						});
					});
					if (entity) {
						if (type === BlockType.RITUAL) {
							let setAside = this.props.entities.get(Zone.SETASIDE);
							if (setAside) {
								let cthun = setAside.find(x => x.cardId === "OG_279");
								if (cthun) {
									cthun = cthun.setTag(GameTag.NUM_TURNS_IN_PLAY, 1);
									action = <div className="played"><Minion
										entity={cthun}
										option={null}
										optionCallback={null}
										assetDirectory={this.props.assetDirectory}
										cards={this.props.cards}
										controller={this.props.player}
										cardArtDirectory={this.props.cardArtDirectory}
									/></div>;
									return false;
								}
							}
						}
						if (entity.getTag(GameTag.CARDTYPE) === CardType.HERO_POWER && !entity.getTag(GameTag.EXHAUSTED)) {
							activatedHeroPower = true;
						}
						if (!action) {
							let type: number|string = entity.getTag(GameTag.CARDTYPE);
							let hidden = false;
							if ((!entity.cardId && this.props.cardOracle && this.props.cardOracle.has(+entity.id)) || entity.getTag(GameTag.SHIFTING)) {
								let cardId = this.props.cardOracle.get(entity.id);
								entity = new Entity(entity.id, entity.getTags(), cardId);
								hidden = true;
								if (this.props.cards && this.props.cards.has(cardId)) {
									type = this.props.cards.get(cardId).type;
								}
							}
							let types = [CardType.WEAPON, CardType.SPELL, CardType.MINION, CardType.HERO_POWER, "WEAPON", "SPELL", "MINION", "HERO_POWER"];
							if (types.indexOf(type) != -1 || entity.getTag(GameTag.SECRET)) {
								let creator = null;
								const creatorId = entity.getTag(GameTag.DISPLAYED_CREATOR);
								if (creatorId) {
									this.props.entities.forEach((map: Immutable.Map<number, Entity>) => {
										map.forEach((toCompare: Entity) => {
											if (toCompare.id === creatorId) {
												creator = toCompare;
											}
										});
									});
								}
								action = <div className="played"><Card
									entity={entity}
									creator={creator}
									option={null}
									optionCallback={null}
									assetDirectory={this.props.assetDirectory}
									cards={this.props.cards}
									isHidden={hidden}
									controller={this.props.player}
									cardArtDirectory={this.props.cardArtDirectory}
									setAside={setAside}
								/></div>;
							}
						}
					}
					if (action && activatedHeroPower) {
						// terminate loop
						return false;
					}
				}
			});
		}

		const playEntities = this.props.entities.get(Zone.PLAY) || Immutable.Map<number, Entity>();
		const playOptions = this.props.options.get(Zone.PLAY) || Immutable.Map<number, Option>();

		const buffedEntities = [];
		playEntities.forEach(entity => {
			let attached = entity.getTag(GameTag.ATTACHED);
			if (attached && buffedEntities.indexOf(attached) === -1) {
				buffedEntities.push(attached);
			}
		});

		/* Equipment */
		let heroEntity = playEntities.filter(filterByCardType(CardType.HERO)).first();
		if (!heroEntity) {
			heroEntity = (this.props.entities.get(Zone.GRAVEYARD) || Immutable.Map<number, Entity>()).filter(filterByCardType(CardType.HERO)).first();
		}
		let hero = <Hero
			entity={heroEntity}
			option={heroEntity ? playOptions.get(heroEntity.id) : null}
			secrets={this.props.entities.get(Zone.SECRET) || Immutable.Map<number, Entity>() }
			optionCallback={this.props.optionCallback}
			cards={this.props.cards}
			assetDirectory={this.props.assetDirectory}
			cardArtDirectory={this.props.cardArtDirectory}
			controller={this.props.player}
			descriptors={this.props.descriptors}
			cardOracle={this.props.cardOracle}
		/>;
		let heroPowerEntity = playEntities.filter(filterByCardType(CardType.HERO_POWER)).first();
		let heroPower = <HeroPower
			entity={heroPowerEntity}
			option={heroPowerEntity ? playOptions.get(heroPowerEntity.id) : null}
			optionCallback={this.props.optionCallback}
			cards={this.props.cards}
			assetDirectory={this.props.assetDirectory}
			cardArtDirectory={this.props.cardArtDirectory}
			controller={this.props.player}
			activated={activatedHeroPower}
		/>;
		let weapon = <Weapon
			entity={playEntities.filter(filterByCardType(CardType.WEAPON)).first() }
			cards={this.props.cards}
			assetDirectory={this.props.assetDirectory}
			cardArtDirectory={this.props.cardArtDirectory}
			controller={this.props.player}
		/>;

		let field = <Field
			entities={playEntities.filter(filterByCardType(CardType.MINION)) || emptyEntities}
			options={playOptions || emptyOptions}
			optionCallback={this.props.optionCallback}
			cards={this.props.cards}
			assetDirectory={this.props.assetDirectory}
			cardArtDirectory={this.props.cardArtDirectory}
			controller={this.props.player}
			descriptors={this.props.descriptors}
			buffedEntities={buffedEntities}
		/>;
		let deck = <Deck
			entities={this.props.entities.get(Zone.DECK) || emptyEntities}
			options={this.props.options.get(Zone.DECK) || emptyOptions}
			cards={this.props.cards}
			assetDirectory={this.props.assetDirectory}
			cardArtDirectory={this.props.cardArtDirectory}
			controller={this.props.player}
			fatigue={this.props.player.getTag(GameTag.FATIGUE) + 1}
		/>;
		let hand = <Hand
			entities={((!this.props.choices || this.props.choices.type !== ChoiceType.MULLIGAN) && this.props.entities.get(Zone.HAND)) || emptyEntities}
			options={this.props.options.get(Zone.HAND) || emptyOptions}
			optionCallback={this.props.optionCallback}
			cards={this.props.cards}
			cardOracle={this.props.cardOracle}
			isTop={this.props.isTop}
			assetDirectory={this.props.assetDirectory}
			cardArtDirectory={this.props.cardArtDirectory}
			controller={this.props.player}
			hideCards={this.props.hideCards}
			setAside={setAside}
		/>;

		let choices = null;
		if (this.props.choices) {
			let choiceEntities = this.props.choices.choices.map((choice: Choice) => {
				let entity = null;
				// search for the entity in all player zones
				let id = choice.entityId;
				this.props.entities.forEach((zoneEntities: Immutable.Map<number, Entity>) => {
					if (zoneEntities.has(id)) {
						entity = zoneEntities.get(id);
						return false;
					}
				});
				if (entity === null) {
					console.error("Entity #" + id + " from choice could not be found for player #" + this.props.player.id + " (playerId=" + this.props.player.playerId + ")");
				}
				return entity;
			}).filter((entity: Entity) => {
				return !!entity;
			});
			choices = <Choices
				entities={choiceEntities}
				cards={this.props.cards}
				cardOracle={this.props.cardOracle}
				mulliganOracle={this.props.mulliganOracle}
				isTop={this.props.isTop}
				assetDirectory={this.props.assetDirectory}
				cardArtDirectory={this.props.cardArtDirectory}
				controller={this.props.player}
				isMulligan={this.props.choices.type === ChoiceType.MULLIGAN}
				choices={this.props.choices && this.props.choices.choices}
				hideCards={this.props.hideCards}
			/>;
		}

		let name = this.props.player.name ?
			<div className="name" title={this.props.player.name}>{this.props.player.name}</div> : null;
		let rank = <Rank
			rank={this.props.player.rank }
			legendRank={this.props.player.legendRank }
			assetDirectory={this.props.assetDirectory}
			cardArtDirectory={this.props.cardArtDirectory}
		/>;

		let crystals = [];
		let resources = this.props.player.getTag(GameTag.RESOURCES) + this.props.player.getTag(GameTag.TEMP_RESOURCES);
		let available = resources - this.props.player.getTag(GameTag.RESOURCES_USED);
		let crystalClassNames = ["crystal"];
		if (available > 0) {
			crystalClassNames.push("full");
		}
		else {
			if (this.props.player.getTag(GameTag.OVERLOAD_LOCKED) > 0) {
				crystalClassNames.push("locked");
			}
			else {
				crystalClassNames.push("empty");
			}
		}
		let tray = (
			<div className="tray">
				<span>{available}/{resources}</span>
				<img src={this.props.assetDirectory("images/mana_crystal.png")}
					 className={crystalClassNames.join(" ") }></img>
			</div>
		);

		let tall = <section className="tall">
			<div className="equipment">
				<section className="entities">
					{hero}
					<section>
						{weapon}
						{heroPower}
					</section>
				</section>
				<section className="details">
					{name}
					{tray}
				</section>
			</div>
			{hand}
		</section>;

		let short = <section className="short">
			{deck}
			{field}
		</section>;

		let classNames = ["player"];

		if (this.props.isTop) {
			classNames.push("top");
		}

		if (this.props.choices) {
			classNames.push("inactive");
		}

		if (this.props.isCurrent && this.props.player.getTag(GameTag.MULLIGAN_STATE) === Mulligan.DONE) {
			classNames.push("current");
		}

		let gameresult = null;
		switch (this.props.player.getTag(GameTag.PLAYSTATE)) {
			case PlayState.WON:
				gameresult = <div className="gameresult">{this.props.player.name} wins!</div>;
				classNames.push("inactive-colored");
				break;
			case PlayState.LOST:
				let message = null;
				if (this.props.player.conceded) {
					message = this.props.player.name + " concedes";
				}
				else {
					message = this.props.player.name + " loses";
				}
				gameresult = <div className="gameresult">{message}</div>;
				classNames.push("inactive");
				break;
			case PlayState.TIED:
				gameresult = <div className="gameresult">{this.props.player.name} ties</div>;
				classNames.push("inactive");
				break;
		}

		if (this.props.isTop) {
			return (
				<div className={classNames.join(" ")}>
					{gameresult}
					{choices}
					{action}
					{tall}
					{short}
				</div>
			);
		}
		else {
			return (
				<div className={classNames.join(" ")}>
					{gameresult}
					{choices}
					{action}
					{short}
					{tall}
				</div>
			);
		}
	}

	public shouldComponentUpdate(nextProps: PlayerProps, nextState) {
		return (
			this.props.player !== nextProps.player ||
			this.props.entities !== nextProps.entities ||
			this.props.options !== nextProps.options ||
			this.props.choices !== nextProps.choices ||
			this.props.optionCallback !== nextProps.optionCallback ||
			this.props.cardOracle !== nextProps.cardOracle ||
			this.props.cards !== nextProps.cards ||
			this.props.descriptors !== nextProps.descriptors ||
			this.props.isCurrent !== nextProps.isCurrent ||
			this.props.hideCards !== nextProps.hideCards
		);
	}
}
