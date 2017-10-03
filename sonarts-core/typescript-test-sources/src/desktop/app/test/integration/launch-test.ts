// This shouldn't be necessary, but without this CI fails on Windows. Seems to
// be a bug in TS itself or ts-node.
/// <reference path="../../../node_modules/@types/node/index.d.ts" />

import 'mocha'
import * as chai from 'chai'

const chaiAsPromised = require('chai-as-promised')
const { Application } = require('spectron')
const path = require('path')

chai.should()
chai.use(chaiAsPromised)

describe('App', function (this: any) {
  let app: any

  beforeEach(function () {
    let appPath = path.join(__dirname, '..', '..', '..', 'node_modules', '.bin', 'electron')
    if (process.platform === 'win32') {
      appPath += '.cmd'
    }
    app = new Application({
      path: appPath,
      args: [
        path.join(__dirname, '..', '..', '..', 'out'),
      ],
    })
    return app.start()
  })

  beforeEach(function () {
    chaiAsPromised.transferPromiseness = app.transferPromiseness
  })

  afterEach(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it('opens a window on launch', function () {
    return app.client.waitUntil(() => app.browserWindow.isVisible(), 5000)
      .getWindowCount().should.eventually.equal(2)
      .browserWindow.isMinimized().should.eventually.be.false
      .browserWindow.isDevToolsOpened().should.eventually.be.false
      .browserWindow.isVisible().should.eventually.be.true
      .browserWindow.isFocused().should.eventually.be.true
      .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0)
      .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0)
  })
})
