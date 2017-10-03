import * as React from "react";
import * as ReactDOM from "react-dom";
import DebugApplication from "./components/DebugApplication";
export * from "./run";

export function renderApplication(target: string) {
	ReactDOM.render(
		<DebugApplication />,
		document.getElementById(target)
	);
}
