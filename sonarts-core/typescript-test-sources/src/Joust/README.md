# Joust
[![Travis](https://img.shields.io/travis/HearthSim/Joust/master.svg)](https://travis-ci.org/HearthSim/Joust)
[![GitHub release](https://img.shields.io/github/release/HearthSim/Joust.svg)](https://github.com/HearthSim/Joust/releases)

Hearthstone replays in your browser, written in Typescript with React.


## Requirements

- Node.js ~v7 (v4.5 should also work, but is not officially supported)
- Build system: `npm install -g gulp webpack`
- Development: `npm install -g electron-prebuilt gulp webpack`
- [yarn](https://yarnpkg.com/): `npm install -g yarn`


## Building

```
yarn --pure-lockfile
gulp compile
```


## Usage

```html
<div id="joust-container"></div>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/react/15.4.0/react.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/react/15.4.0/react-dom.min.js"></script>
<link rel="stylesheet" href="joust.css"></link>
<script type="text/javascript" src="joust.js"></script>
<script type="text/javascript">
	Joust.launcher("joust-container")
		.height(500)
		.width(500)
		.fromUrl("//example.org/brawl.hsreplay");
</script>
```

[Full documentation](https://github.com/HearthSim/Joust/wiki/Embedding).

Joust does not do any polyfilling and expects the globals Promise and fetch to be available.

## Development

Watch TypeScript with Webpack:

```
webpack -d --watch
```

Watch HTML and LESS:

```
gulp watch
```


## License

Copyright © HearthSim. All Rights Reserved.

### Third party assets

- The Font Awesome font is licensed under the SIL OFL 1.1.
- The Font Awesome style code is licensed under the MIT license.
- Some Hearthstone textures are copyright © Blizzard Entertainment


## Community

This is a [HearthSim](https://hearthsim.info) project. All development
happens on our IRC channel `#hearthsim` on [Freenode](https://freenode.net).
