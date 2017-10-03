# Joust Changelog
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- Show creator for created cards on play (#49)
- HSReplay: Add warning if tag is missing required entity id
- Add Quest frame art
- Support Shifting Blade
- Show Quests above hero portrait

### Changed
- Tweak art for legendary minions in hand

### Fixed
- Fix fullscreen callback in Launcher not being called
- Fix weapons in hand not highlighting increased durability
- Fix XML errors not terminating parser early

### Deprecated
- `Launcher.metadataSource` is no longer supported

## [0.11.0] - 2017-03-25
### Added
- Write `VERSION` file when building
- Add `Launcher.rewind()`
- Add `Launcher.playing`

### Changed
- Switch to [Yarn package manager](https://yarnpkg.com/) (#169)
- Adjust loading screen messages
- Switch to the screenfull library
- Upgrade to Webpack 2 (#184)
- Switch from typings to @types packages
- Switch to fetch in Launcher
- Upgrade hearthstonejson to 0.4.0

### Fixed
- Fix `Launcher.onFullscreen` throwing error messages on some devices
- Fix conflicts between `Launcher.play` and `Launcher.startPaused`
- HSReplay: Fix crash when encountering MetaData outside of Block
- Scrubber: Fix missing last turn in replays without mulligan data
- Fix missing message when both players tie
- Fix race condition in launcher (#191)
- Fix naming conflict in GameStateScrubber with Duplex

### Removed
- Remove `babel-polyfill`

## [0.10.0] - 2017-01-16
### Added
- Add `Launcher.addPlayerName(playerName: string)`
- Implement Kazakus Potion text formatting (@azeier)
- Implement Jade Golem text formatting (@azeier)
- Enable `Launcher.locale` after initial render
- Add `Launcher.build: number|null`
- Save Event Log state in a cookie (#173)
- Add settings menu to Scrubber
- Add setting for users to change card locale
- Add `Launcher.selectedLocale: string|null`
- Add `Launcher.onSelectLocale(callback: (locale: string) => void): void`

### Changed
- Change `Launcher.fromUrl` to return launcher instance

### Fixed
- Fix spellpower changes not updating cards in hand (#182)

## [0.9.1] - 2016-11-19
### Fixed
- Fix intermediate game states getting lost
- Fix The Coin showing up as a mulligan card

## [0.9.0] - 2016-11-17
### Added
- Add several character states (#7, @azeier)
- Add up/down keybindings to skip to previous/next action (#177)

### Removed
- Remove autoplay behaviour if `Launcher.startFromTurn` is set
- Remove deprecated methods `Launcher.metadata` and `.textures`

### Fixed
- Fix previously hidden entities with 0/0 stats (e.g. Prince Malchezaar)
- Fix `GameState.getPlayerCount()`
- Fix missing turns in reconnected replays
- Fix multiple C'Thuns appearing at the same time (#175)
- Fix a null pointer in EventLog
- Fix jumping to start/end of turn in reconnected games (#172)
- Fix minions with charge being shown as asleep
- Fix Windows build (#176, @YuntianZhang)
- Fix cards with invalid data having no frame

## [0.8.0] - 2016-10-10
### Added
- Show Prince Malchezaar at game start (#142, @azeier)
- Show C'Thun stats in opponent hand (#133, @azeier)
- Show C'Thun as a minion during ritual (#137, @azeier)
- Highlight Hero Power when it's played (#140, @azeier)
- Add `GameState.getPlayer(playerId: number): Player`

### Changed
- Update dependencies
- Improve skip back behaviour when replay is paused
- Replace react-dimensions with a custom implementation (#121)
- Show error to user when fullscreen entering fails (#123)

### Fixed
- Malchezaar causing delay before Mulligan (#136, @azeier)
- Fix Mulligan X loading in late
- Attempt to reveal the coin even when not played (#163)
- Fix bounced cards retaining stat buffs for the opponent
- Fix cookies immediately expiring

## [0.7.0] - 2016-09-19
### Added
- Add C'Thun Rituals (@azeier)
- Add `Joust.destroy()`
- Add `Launcher.onFullscreen(callback:(fullscreen:boolean) => void)`
- Add `Launcher.onReady(ready:() => void)`
- Add `Launcher.fullscreen(fullscreen: boolean)`
- Shrinkwrap dependencies
- Add `gulp sentry:release`
- Add ES2015 polyfills using `babel-polyfill`
- Hide statistics for minions with HIDE\_STATS (#128, @jleclanche)
- Add `Launcher.enableKeybindings()` and `Launcher.disableKeybindings()`
- Add golden inplay frames (#134, @andburn)
- Add class borders for golden cards (#134, @andburn)

### Changed
- Replace own HearthstoneJSON implementation with common one
- Tweak scrubber tooltips
- Keybindings no longer have priority over non-joust HTML inputs
- Rescale speeds by a factor of 1.5
- Improve card description formatting
- HSReplay: Don't bail when encountering unknown tags

### Fixed
- Fix Shifter Zerus in hidden hand
- Improve Scrubber performance
- Fix minions being asleep when they shouldn't be

## [0.6.0] - 2016-08-21
### Added
- Add loading screen messages
- Show Hero Power and Weapon details on mouse over
- Various loading screen strings
- Add locale support
- Defer metadata fetching to hearthstonejson on npm
- Add Launcher.metadataSource to override HearthstoneJSON

### Fixed
- Show current stats when hovering entities
- Fix launcher example in README.md
- Fix default card art endpoint
- Fix GameStateScrubber.percentageWatched returning +/-Infinity

### Changed
- Don't unexhaust hero powers when hovering
- Update README.md
- Switch to Typescript 2.0.0

### Deprecated
- `Launcher.metadata` is now obsolete

## [0.5.0] - 2016-08-13
### Added
- Save replay speed preference in cookie
- Save ignore browser warning in cookie
- Unexhaust weapons and hero powers when hovering

### Changed
- Tweak text positioning
- Change timeline cursor (graphical)
- Improve performance when resizing applet horizontally

### Removed
- Remove proprietary fonts from source

### Fixed
- Changelog formatting
- Fix error when skipping back during Mulligan

## [0.4.0] - 2016-08-07
### Added
- Display keybindings in scrubber tooltips
- `Launcher.cardArt()` and `.assets()` can now accept a callback
- Ensure fullscreen does not error on unsupported devices (#123)
- Launcher: Add `.duration`, `.secondsWatched` and `.percentageWatched`

## [0.3.1] - 2016-08-01
### Fixed
- Fix minion hovering region for full card

## [0.3.0] - 2016-07-31
### Added
- Highlight cards that are swapped during Mulligan
- Display full card when hovering minions
- Show warning to users of IE/Edge due to clip-path not being supported
- Automatically run `typings install` on `npm install`
- Add Node v6.3 to supported versions

### Changed
- Reduce the pause after card is drawn
- Tweak tooltips
- Remove the pause between cards played by Yogg-Sarron
- Increase width of play/pause button
- Automatically download enums.d.ts on `npm install`

### Fixed
- Fix release URLs in Changelog

## [0.2.0] - 2016-07-28
### Added
- Metrics now contain a release tag
- Add tooltip when hovering secrets
- Add custom tooltips for scrubber buttons
- Lock screen orientation to landscape in fullscreen (#46)
- Display player concedes (#114)
- Add Changelog

### Changed
- Fully rework timings, greatly improving playback
- `Joust.release()` now reports a Semver string
- Prevent context menu in most places
- Reorder scrubber buttons

### Fixed
- Fix graphical glitch in timeline when Mulligan was very short

## 0.1.0 - 2016-07-25
### Added
- Code for initial development release

[Unreleased]: https://github.com/HearthSim/Joust/compare/0.11.0...HEAD
[0.11.0]: https://github.com/HearthSim/Joust/compare/0.10.0...0.11.0
[0.10.0]: https://github.com/HearthSim/Joust/compare/0.9.1...0.10.0
[0.9.1]: https://github.com/HearthSim/Joust/compare/0.9.0...0.9.1
[0.9.0]: https://github.com/HearthSim/Joust/compare/0.8.0...0.9.0
[0.8.0]: https://github.com/HearthSim/Joust/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/HearthSim/Joust/compare/0.6.0...0.7.0
[0.6.0]: https://github.com/HearthSim/Joust/compare/0.5.0...0.6.0
[0.5.0]: https://github.com/HearthSim/Joust/compare/0.4.0...0.5.0
[0.4.0]: https://github.com/HearthSim/Joust/compare/0.3.1...0.4.0
[0.3.1]: https://github.com/HearthSim/Joust/compare/0.3.0...0.3.1
[0.3.0]: https://github.com/HearthSim/Joust/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/HearthSim/Joust/compare/0.1.0...0.2.0
