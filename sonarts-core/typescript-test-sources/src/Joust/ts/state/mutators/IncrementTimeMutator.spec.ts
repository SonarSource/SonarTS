import GameState from "../GameState";
import IncrementTimeMutator from "./IncrementTimeMutator";

describe("IncrementTimeMutator", () => {

	it("should have a default time increment of 1", () => {
		let mutator = new IncrementTimeMutator();
		expect(mutator.time).toEqual(1);
	});

	it("should save the time increment", () => {
		let expected = 42;
		let mutator = new IncrementTimeMutator(expected);
		expect(mutator.time).toEqual(expected);
	});

	it("should have a mutable time increment", () => {
		let mutator = new IncrementTimeMutator();
		let expected = 42;
		mutator.time = expected;
		expect(mutator.time).toEqual(expected);
	});

	it("should set the time of a new gamestate to 0", () => {
		let state = new GameState();
		let mutator = new IncrementTimeMutator(42);
		let expected = 0;
		expect(mutator.applyTo(state).time).toEqual(expected);
	});

	it("should increase the time of a gamestate by the time increment", () => {
		let state = new GameState();

		let mutator1 = new IncrementTimeMutator();
		let mutator2 = new IncrementTimeMutator(3);
		let expected = 0;

		state = state.apply(mutator1);
		expect(state.time).toEqual(expected);

		expected += mutator2.time;

		state = state.apply(mutator2);
		expect(state.time).toEqual(expected);
	});

});
