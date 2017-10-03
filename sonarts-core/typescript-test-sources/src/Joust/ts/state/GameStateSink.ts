import * as Stream from "stream";


/**
 * Emits game states written to it as "gamestate" events.
 */
export default class GameStateSink extends Stream.Writable {
	constructor() {
		let opts: Stream.WritableOptions = {};
		opts.objectMode = true;
		super(opts);
	}

	_write(chunk: any, encoding: string, callback: Function) {
		this.emit("gamestate", chunk);
		callback();
	}
}
