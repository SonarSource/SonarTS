//// [tests/cases/conformance/jsx/tsxAttributeResolution10.tsx] ////

//// [react.d.ts]
declare module JSX {
	interface Element { }
	interface IntrinsicElements {
	}
	interface ElementAttributesProperty {
		props;
	}
}

//// [file.tsx]
export class MyComponent {  
  render() {
  }

  props: {
  	[s: string]: boolean;
  }
}

// Should be an error
<MyComponent bar='world' />;

// Should be OK
<MyComponent bar={true} />;

// Should be ok
<MyComponent data-bar='hello' />;


//// [file.jsx]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var MyComponent = (function () {
        function MyComponent() {
        }
        MyComponent.prototype.render = function () {
        };
        return MyComponent;
    }());
    exports.MyComponent = MyComponent;
    // Should be an error
    <MyComponent bar='world'/>;
    // Should be OK
    <MyComponent bar={true}/>;
    // Should be ok
    <MyComponent data-bar='hello'/>;
});
