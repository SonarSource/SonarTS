# Graphcool Console

🚀  Official source of [console.graph.cool](https://console.graph.cool/) written in Typescript 2 and based on React & Relay

## Changelog

### [Milestone M9](https://github.com/graphcool/console/milestone/9)
* This milestone was all about bug hunting! We fixed over 30 bugs!
* And for the new people of you we implemented a welcome screen 👋 that gives you a better introduction to our product :)

See **[here](CHANGELOG.md)** for a full list of all changes (features/bug fixes).

## Development


master | dev
--- | ---
[![CircleCI](https://circleci.com/gh/graphcool/console/tree/master.svg?style=svg)](https://circleci.com/gh/graphcool/console/tree/master) | [![CircleCI](https://circleci.com/gh/graphcool/console/tree/dev.svg?style=svg)](https://circleci.com/gh/graphcool/console/tree/dev)

```sh
# install dependencies
npm install -g yarn
yarn install
# prebuild dependencies
npm run dll
# run local server on :4000 using the offical Graphcool API
env BACKEND_ADDR="https://dev.api.graph.cool" npm start
# or for fish shell users
set -x BACKEND_ADDR https://dev.api.graph.cool npm start
```
### IDE Setup (Webstorm)

We use a different version of TypeScript than the default Webstorm TypeScript compiler. That's why you have to do the following to get rid of all TypeScript errors.
Please run `yarn install` before the setup.

1. Go to the `Preferences` _(macOS: "⌘ + ,")_ window
2. In the left list menu **select** `Languages & Frameworks > TypeScript`
3. **Click** on the `Edit...` button in the `Common` Panel
4. **Select** `Custom directory`
5. **Browse** to your `project directory` and then **select** `node_modules/typescript/lib` and **click** `OK`
6. **Click** `OK` again in the `Configure TypeScript Compiler`
7. **Click** `OK` in the `Preference` window



## Help & Community [![Slack Status](https://slack.graph.cool/badge.svg)](https://slack.graph.cool)

Join our [Slack community](http://slack.graph.cool/) if you run into issues or have questions. We love talking to you!

![](http://i.imgur.com/5RHR6Ku.png)
