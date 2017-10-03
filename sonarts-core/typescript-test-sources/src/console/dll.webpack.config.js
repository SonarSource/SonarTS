const webpack = require('webpack')

const vendor = [
  'auth0-lock',
  'babel-plugin-transform-async-to-generator',
  'bluebird',
  'calculate-size',
  'classnames',
  'cookiestore',
  'cuid',
  'drumstick',
  'graphiql',
  'immutable',
  'lodash',
  'lokka',
  'lokka-transport-http',
  'map-props',
  'moment',
  'normalize.css',
  'rc-tooltip',
  'react',
  'react-addons-pure-render-mixin',
  'react-addons-shallow-compare',
  'react-autocomplete',
  'react-click-outside',
  'react-codemirror',
  'react-copy-to-clipboard',
  'react-datetime',
  'react-dom',
  'react-ga',
  'react-helmet',
  'react-input-enhancements',
  'react-notification-system',
  'react-redux',
  'react-relay',
  'react-router',
  'react-router-relay',
  'react-tagsinput',
  'react-tether',
  'react-toggle-button',
  'react-tooltip',
  'react-twitter-widgets',
  'react-virtualized',
  'redux',
  'redux-actions',
  'redux-logger',
  'redux-thunk',
  'styled-components',
  'tachyons',
]

module.exports = {
  entry: {
    // create two library bundles, one with jQuery and
    // another with Angular and related libraries
    vendor
  },

  module: {
    rules: [{
      enforce: 'pre',
      test: /\.ts(x?)$/,
      loader: 'tslint-loader',
      exclude: /node_modules/,
    }, {
      test: /\.json$/, // TODO check if still needed
      loader: 'json-loader',
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader',
    }, {
      test: /\.scss$/,
      // loader: 'style!css?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap',
      loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!sass-loader',
      exclude: /node_modules/,
    }, {
      test: /\.ts(x?)$/,
      exclude: /node_modules/,
      loader: 'babel-loader!awesome-typescript-loader',
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }, {
      test: /\.mp3$/,
      loader: 'file-loader',
    }, {
      test: /icons\/.*\.svg$/,
      loader: 'raw-loader!svgo-loader',
    }, {
      test: /graphics\/.*\.svg$/,
      loader: 'file-loader',
    }, {
      test: /(graphics|gifs)\/.*\.(png|gif)$/,
      loader: 'file-loader',
    }],
  },

  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/dll/',

    // The name of the global variable which the library's
    // require() function will be assigned to
    library: '[name]_lib',
  },

  plugins: [
    new webpack.DllPlugin({
      // The path to the manifest file which maps between
      // modules included in a bundle and the internal IDs
      // within that bundle
      path: __dirname + '/dll/[name]-manifest.json',
      // The name of the global variable which the library's
      // require function has been assigned to. This must match the
      // output.library option above
      name: '[name]_lib'
    }),
  ],
}
