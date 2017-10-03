import * as React from "react";
import Entity from "./Entity";
import Option from "./Option";
import GameState from "./state/GameState";
import {EventEmitter} from "events";
import GameStateSink from "./state/GameStateSink";
import GameStateHistory from "./state/GameStateHistory";
import Player from "./Player";
import GameStateDescriptor from "./state/GameStateDescriptor";
import GameWidget from "./components/GameWidget";
import * as Immutable from "immutable";

export interface EntityInPlayProps extends EntityProps, OptionProps, GameStateDescriptorStackProps, React.ClassAttributes<any> {
	isTarget?: boolean;
}

export interface EntityInPlayState {
	isHovering?: boolean;
}

export interface EntityListProps extends OptionCallbackProps, ControllerProps, CardDataProps,
	CardOracleProps, AssetDirectoryProps, CardArtDirectory, GameStateDescriptorStackProps, HideCardsProps, React.ClassAttributes<any> {
	entities: Immutable.Iterable<number, Entity>;
	options?: Immutable.Iterable<number, Option>;
	isTop?: boolean;
}

export interface ControllerProps {
	controller?: Player;
}

export interface EntityProps extends CardDataProps, ControllerProps, AssetDirectoryProps, CardArtDirectory {
	entity: Entity;
	damage?: number;
	healing?: number;
	buffed?: boolean;
}

export interface OptionCallbackProps {
	optionCallback?(option: Option, target?: number, position?: number): void;
}

export interface OptionProps extends OptionCallbackProps {
	option?: Option;
}

export interface JoustClient {
	isInteractive(): boolean;
}

export interface ActionHandler {
	sendOption(option: Option): void;
}

export interface KettleClient extends EventEmitter {
	connect(): void;
	disconnect(): void;
	write(buffer: Buffer): void;
}

export interface InteractiveBackend {
	startGame(): void;
	sendOption(option: Option, target?: number, position?: number): void;
	chooseEntities(entities: Entity[]): void;
	exitGame(): void;
}

export interface StreamScrubber extends EventEmitter {
	play(): void;
	pausePlayback(): void;
	toggle(): void;
	setSpeed(speed: number): void;
	seek(time: number): void;
	isPlaying(): boolean;
	isPlaybackPaused(): boolean;
	canInteract(): boolean;
	canRewind(): boolean;
	rewind(): void;
	fastForward(): void;
	getCurrentTime(): number;
	getCurrentTurn(): number;
	getSpeed(): number;
	canPlay(): boolean;
	getHistory(): GameStateHistory;
	getDuration(): number;
	setInhibitor(inhibitor: StreamScrubberInhibitor): void;
	nextTurn(): void;
	previousTurn(): void;
	skipBack(): void;
	nextAction(): void;
	previousAction(): void;
	hasEnded(): boolean;
}

export interface CardData {
	id?: string;

	// enums
	rarity?: string;
	faction?: string;
	set?: string;
	playerClass?: string;
	type?: string;
	race?: string;

	// localized
	name?: string;
	text?: string;
	collectionText?: string;
	flavor?: string;
	howToEarn?: string;
	howToEarnGolden?: string;
	targetingArrowText?: string;
	textInPlay?: string;

	// additional
	collectible?: boolean;
	cost?: number;
	attack?: number;
	health?: number;
	durability?: number;
	dust?: number[];

	mechanics?: string[]; // enum
	artist?: string;
	texture?: string;
}

export interface CardDataProps {
	cards?: Immutable.Map<string, CardData>;
}

export interface CardOracleProps {
	cardOracle?: Immutable.Map<number, string>;
}

export interface MulliganOracleProps {
	mulliganOracle?: Immutable.Map<number, boolean>;
}

export interface CardOracle extends EventEmitter {
	getCardMap(): Immutable.Map<number, string>;
}

export interface MulliganOracle extends EventEmitter {
	getMulligans(): Immutable.Map<number, boolean>;
}

export interface AssetDirectoryProps {
	assetDirectory: (asset: string) => string;
}

export interface CardArtDirectory {
	cardArtDirectory: (cardId: string) => string;
}

export interface QueryCardMetadata {
	(build: number, cb: (cards: CardData[]) => void): void;
}

export interface LocaleProps {
	locale?: string;
}

export interface KeybindingProps {
	enableKeybindings?: boolean;
}

export interface GameWidgetProps extends AssetDirectoryProps, CardArtDirectory, EventHandlerProps, LocaleProps, KeybindingProps, React.ClassAttributes<GameWidget> {
	sink: GameStateSink;
	startupTime: number;
	interaction?: InteractiveBackend;
	scrubber?: StreamScrubber;
	getImageURL?: (cardId: string) => string;
	exitGame?: () => void;
	cardOracle?: CardOracle;
	mulliganOracle?: MulliganOracle;
	width?: any;
	height?: any;
	debug?: boolean;
	logger?: (error: Error) => void;
	startRevealed?: boolean;
	onToggleReveal?: (reveal: boolean) => void;
	startSwapped?: boolean;
	onToggleSwap?: (swap: boolean) => void;
	onFullscreen?: (fullscreen: boolean) => void;
	onReady?: () => void;
	playerNames?: string[];
	selectLocale?: (locale: string, loaded?: () => void) => void;
	loadingError?: boolean;
}

export interface StreamScrubberInhibitor {
	isInhibiting: () => boolean;
}

export interface RankProps extends AssetDirectoryProps, CardArtDirectory, React.ClassAttributes<any> {
	rank?: number;
	legendRank?: number;
}

export interface GameStateDescriptorStackProps {
	descriptors?: Immutable.Stack<GameStateDescriptor>;
}

export interface HideCardsProps {
	hideCards?: boolean;
}

export interface JoustEventHandler {
	(event: string, values: Object, tags?: Object): void;
}

export interface EventHandlerProps {
	events?: JoustEventHandler;
}

export interface HistoryEntry {
	state: GameState;
	next?: HistoryEntry;
	prev?: HistoryEntry;
}

export interface GameStateDiff {
	tag: number;
	entity: number;
	previous: number;
	current: number;
}

export interface EventLogItemData {
	type: LineType;
	time?: number;
	entityId?: number;
	targetId?: number;
	player?: string;
	data?: number;
	data2?: number;
	indent?: boolean;
}

export const enum LineType {
	Turn = 1,
	Draw,
	Play,
	Summon,
	ArmorBuff,
	AttackBuff,
	HealthBuff,
	AttackReduce,
	HealthReduce,
	Attack,
	Death,
	Get,
	Trigger,
	Damage,
	Healing,
	Remove,
	Mulligan,
	DivineShield,
	Taunt,
	CantBeDamaged,
	Windfury,
	Silenced,
	Charge,
	Frozen,
	Stealth,
	Concede,
	Win,
	Replace,
	StatsBuff,
	Cthun,
	Discard,
	GetToDeck,
	DiscardFromDeck,
	Steal,
	DeckToPlay,
	PlayToDeck,
	PlayToHand,
	Weapon,
	TurnEnd,
}
