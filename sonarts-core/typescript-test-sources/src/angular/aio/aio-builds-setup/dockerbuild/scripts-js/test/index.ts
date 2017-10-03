// Imports
import {runTests} from '../lib/common/run-tests';

// Run
const specFiles = [`${__dirname}/**/*.spec.js`];
const helpers = [`${__dirname}/helpers.js`];
runTests(specFiles, helpers);
