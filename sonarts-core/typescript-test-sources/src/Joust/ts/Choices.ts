import Choice from "./Choice";
import * as Immutable from "immutable";

export default class Choices {

	constructor(protected _choices: Immutable.Map<number, Choice>, protected _type: number) {
	}

	get choices(): Immutable.Map<number, Choice> {
		return this._choices;
	}

	get type(): number {
		return this._type;
	}
}
