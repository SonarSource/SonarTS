import GameState from "./GameState";

describe("GameState", () => {

	it("should start at time null", () => {
		let state = new GameState();
		expect(state.time).toBeNull();
	});

});
