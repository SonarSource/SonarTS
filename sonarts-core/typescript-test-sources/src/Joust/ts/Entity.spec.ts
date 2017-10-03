import Entity from "./Entity";
import * as Immutable from "immutable";
import {GameTag} from "./enums";

describe("Entity", () => {

	it("should save the entity id", () => {
		let entity = new Entity(1, Immutable.Map<string, number>());
		expect(entity.id).toBe(1);
	});

	it("should save an identical set of tags", () => {
		let tags = Immutable.Map<string, number>();
		tags = tags.set("" + GameTag.HEALTH, 42);
		let entity = new Entity(15, tags);
		expect(entity.getTags()).toBe(tags);
	});

	it("should not modify tags on card id change", () => {
		let tags = Immutable.Map<string, number>();
		tags = tags.set("" + GameTag.HEALTH, 42);
		let entity = new Entity(16, tags);
		entity = entity.setCardId("GVG_001");
		expect(entity.getTags()).toBe(tags);
	});

	it("should cast to string", () => {
		let entity = new Entity(21, Immutable.Map<string, number>());
		expect(entity.toString()).toEqual("Entity #21");
		entity = entity.setCardId("GVG_001");
		expect(entity.toString()).toEqual("Entity #21 (GVG_001)");
	});
});
