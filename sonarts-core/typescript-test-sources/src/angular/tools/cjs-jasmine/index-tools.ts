/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-var-keyword */

'use strict';

var glob = require('glob');
require('zone.js/dist/zone-node.js');
var JasmineRunner = require('jasmine');
var path = require('path');
require('zone.js/dist/long-stack-trace-zone.js');
require('zone.js/dist/proxy.js');
require('zone.js/dist/sync-test.js');
require('zone.js/dist/async-test.js');
require('zone.js/dist/fake-async-test.js');

var jrunner = new JasmineRunner();
(global as any)['jasmine'] = jrunner.jasmine;
require('zone.js/dist/jasmine-patch.js');
var toolsDir = process.cwd() + '/dist/tools';
function toolsDirRequire(moduleId: string) {
  return require(path.join(toolsDir, moduleId));
}

// Tun on full stack traces in errors to help debugging
(<any>Error)['stackTraceLimit'] = Infinity;

jrunner.jasmine.DEFAULT_TIMEOUT_INTERVAL = 100;

// Support passing multiple globs
var globsIndex = process.argv.indexOf('--');
var args: string[];
if (globsIndex < 0) {
  args = [process.argv[2]];
} else {
  args = process.argv.slice(globsIndex + 1);
}

var specFiles = args.map(function(globstr: string) { return glob.sync(globstr, {cwd: toolsDir}); })
                    .reduce((specFiles: string[], paths: string[]) => specFiles.concat(paths), []);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100;

jrunner.configureDefaultReporter({showColors: process.argv.indexOf('--no-color') === -1});

jrunner.onComplete(function(passed: boolean) { process.exit(passed ? 0 : 1); });
jrunner.projectBaseDir = path.resolve(__dirname, '../../');
jrunner.specDir = '';
specFiles.forEach((file: string) => { toolsDirRequire(file); });
jrunner.execute();
