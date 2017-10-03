import * as Immutable from "immutable";
import Player from "./Player";

describe("Player", () => {

	it("should have a well-formed constructor", () => {
		let tags = Immutable.Map<string, number>();
		let player = new Player(2, tags, 1, "BehEh", 3, 5, true);
		expect(player.id).toEqual(2);
		expect(player.getTags()).toEqual(tags);
		expect(player.playerId).toEqual(1);
		expect(player.name).toEqual("BehEh");
		expect(player.rank).toEqual(3);
		expect(player.legendRank).toEqual(5);
		expect(player.conceded).toEqual(true);
	});

	it("should cast to string", () => {
		let player = new Player(2, Immutable.Map<string, number>(), 1, "BehEh");
		expect(player.toString()).toEqual("Player #2 (playerId: 1, name: \"BehEh\")");
	});

});
