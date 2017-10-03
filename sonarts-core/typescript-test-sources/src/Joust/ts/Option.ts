export default class Option {

	constructor(protected _index: number, protected _type: number, protected _entityId: number, protected _targets: number[]) {
		if (!this._targets) {
			this._targets = [];
		}
	}

	get index(): number {
		return this._index;
	}

	get type(): number {
		return this._type;
	}

	get entityId(): number {
		return this._entityId;
	}

	public hasTargets(): boolean {
		return this.targets.length > 0;
	}

	public isTarget(target: number): boolean {
		return (
			this.targets.filter((proposedTarget) => {
				return proposedTarget === target;
			}).length === 1
		);
	}

	get targets(): number[] {
		return this._targets;
	}
}
