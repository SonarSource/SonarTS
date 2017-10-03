import GameStateHistory from "./GameStateHistory";
import GameState from "./GameState";
import Entity from "../Entity";
import * as Immutable from "immutable";
import {GameTag, Step} from "../enums";

describe("GameStateHistory", () => {

	let history;
	let stateZero = new GameState(undefined, undefined, undefined, undefined, 0);
	let stateOne = new GameState(undefined, undefined, undefined, undefined, 1);
	let stateTwo = new GameState(undefined, undefined, undefined, undefined, 2);
	let stateFour = new GameState(undefined, undefined, undefined, undefined, 4);
	let onePlayerEntityTree = Immutable.Map<number, Immutable.Map<number, Immutable.Map<number, Entity>>>().set(1, null);
	let stateMulligan = new GameState(Immutable.Map<number, Entity>().set(1, new Entity(1, Immutable.Map<number>({
		[GameTag.STEP]: Step.BEGIN_MULLIGAN,
		[GameTag.TURN]: 1,
	}))), undefined, undefined, undefined, 15);
	let stateTurnOne = new GameState(Immutable.Map<number, Entity>().set(1, new Entity(1, Immutable.Map<number>({
		[GameTag.STEP]: Step.MAIN_START,
		[GameTag.TURN]: 1,
	}))), undefined, undefined, undefined, 20);
	let stateTurnOne2 = new GameState(Immutable.Map<number, Entity>().set(1, new Entity(1, Immutable.Map<number>({
		[GameTag.STEP]: Step.MAIN_START,
		[GameTag.TURN]: 1,
	}))), undefined, undefined, undefined, 22);
	let stateTurnTwoDraw = new GameState(Immutable.Map<number, Entity>().set(1, new Entity(1, Immutable.Map<number>({
		[GameTag.STEP]: Step.MAIN_DRAW,
		[GameTag.TURN]: 2,
	}))), onePlayerEntityTree, undefined, undefined, 24);
	let stateTurnTwo = new GameState(Immutable.Map<number, Entity>().set(1, new Entity(1, Immutable.Map<number>({
		[GameTag.STEP]: Step.MAIN_START,
		[GameTag.TURN]: 2,
	}))), undefined, undefined, undefined, 25);

	beforeEach(() => {
		history = new GameStateHistory();
	});

	describe("has a turnMap that", () => {

		it("should be initialized as empty", () => {
			expect(history.turnMap.count()).toBe(0);
		});

		it("should track states with distinct turns", () => {
			history.push(stateTurnOne);
			expect(history.turnMap.count()).toBe(1);
			expect(history.turnMap.get(1)).toBe(stateTurnOne);
			history.push(stateTurnTwo);
			expect(history.turnMap.count()).toBe(2);
			expect(history.turnMap.get(2)).toBe(stateTurnTwo);
		});

		it("should not track states without a turn", () => {
			history.push(stateOne);
			expect(history.turnMap.count()).toBe(0);
		});

		it("should not track states with duplicate turns", () => {
			history.push(stateTurnOne);
			expect(history.turnMap.count()).toBe(1);
			expect(history.turnMap.get(1)).toBe(stateTurnOne);
			history.push(stateTurnOne2);
			expect(history.turnMap.count()).toBe(1);
			expect(history.turnMap.get(1)).toBe(stateTurnOne);
		});

		it("should not track states where the step is not MAIN_START", () => {
			history.push(stateTurnOne);
			expect(history.turnMap.count()).toBe(1);
			expect(history.turnMap.get(1)).toBe(stateTurnOne);
			history.push(stateTurnTwoDraw);
			expect(history.turnMap.count()).toBe(1);
			expect(history.turnMap.get(1)).toBe(stateTurnOne);
			history.push(stateTurnTwo);
			expect(history.turnMap.count()).toBe(2);
			expect(history.turnMap.get(2)).toBe(stateTurnTwo);
		});

		it("should not track mulligan states", () => {
			history.push(stateMulligan);
			expect(history.turnMap.count()).toBe(0);
		});

		it("should track the first state past mulligan, even if it's step is not MAIN_START", () => {
			history.push(stateTurnTwoDraw);
			expect(history.turnMap.count()).toBe(1);
			expect(history.turnMap.get(2)).toBe(stateTurnTwoDraw);
		});
	});

	it("should set the first state as its head", () => {
		history.push(stateOne);
		expect(history.head.state).toBe(stateOne);
	});

	it("should set the last state as its head", () => {
		history.push(stateOne);
		history.push(stateTwo);
		expect(history.head.state).toBe(stateTwo);
	});

	it("should set the first state as its tail", () => {
		history.push(stateOne);
		expect(history.tail.state).toBe(stateOne);
	});

	it("should not move its tail", () => {
		history.push(stateOne);
		history.push(stateTwo);
		expect(history.tail.state).toBe(stateOne);
	});

	describe("with two states", () => {

		beforeEach(() => {
			history.push(stateOne);
			history.push(stateTwo);
		});

		it("should not have newer elements affect the tail", () => {
			expect(history.tail.state).toBe(stateOne);
		});

		it("should set a newer element as head", () => {
			expect(history.head.state).toBe(stateTwo);
		});

		it("should exactly fetch the latest state", () => {
			expect(history.getLatest(1)).toBe(stateOne);
			expect(history.getLatest(2)).toBe(stateTwo);
		});

		it("should fetch the latest state", () => {
			expect(history.getLatest(1.5)).toBe(stateOne);
			expect(history.getLatest(1.99)).toBe(stateOne);
			expect(history.getLatest(3)).toBe(stateTwo);
		});

		it("should be clamped to the earliest state", () => {
			expect(history.getLatest(0)).toBe(stateOne);
			expect(history.getLatest(0.9)).toBe(stateOne);
		});

	});

	describe("with three states", () => {

		beforeEach(() => {
			history.push(stateOne);
			history.push(stateTwo);
			history.push(stateFour);
		});

		it("should fetch the latest state", () => {
			expect(history.getLatest(1.9)).toBe(stateOne);
			expect(history.getLatest(2)).toBe(stateTwo);
			expect(history.getLatest(3)).toBe(stateTwo);
			expect(history.getLatest(3.9)).toBe(stateTwo);
			expect(history.getLatest(4)).toBe(stateFour);
			expect(history.getLatest(10)).toBe(stateFour);
		});

	});

	describe("with a state", () => {

		beforeEach(() => {
			history.push(stateZero);
			history.push(stateOne);
		});

		it("should fetch the latest state", () => {
			expect(history.getLatest(0.9)).toBe(stateZero);
			expect(history.getLatest(1)).toBe(stateOne);
			expect(history.getLatest(1.1)).toBe(stateOne);
			expect(history.getLatest(10)).toBe(stateOne);
		});

	});

});
