//// [file.tsx]
declare module JSX {
	interface Element { }
	interface IntrinsicElements { div; span; }
}

var x = </**/div></div>;


//// [file.jsx]
var x = <div></div>;
