/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var webpack = require('webpack');

/**
 * Wraps the original `webpack` function to convert execution
 * result to a promise and properly report errors.
 *
 * @param options
 * @returns {Function}
 */
function webPackPromiseify(options) {
  return new Promise(function(resolve, reject) {

    webpack(options, function(err, stats) {
      var jsonStats = stats.toJson() || {};
      var statsErrors = jsonStats.errors || [];

      if (err) {
        return reject(err);
      }

      if (statsErrors.length) {
        return reject(statsErrors);
      }

      return resolve(stats);
    });

  });
}

module.exports = webPackPromiseify;
