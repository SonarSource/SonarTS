const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const cssnano = require('cssnano')
const path = require('path')
const cheerio = require('cheerio')
const fs = require('fs')

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
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: [
      'babel-polyfill',
      './src/main',
      './src/styles/codemirror.css',
      // './src/styles/graphiql.css',
      'codemirror/mode/javascript/javascript',
      'codemirror/mode/shell/shell',
      // 'codemirror/lib/codemirror.css',
      // 'codemirror/theme/dracula.css',
      'graphcool-graphiql/graphiql_dark.css',
    ],
    styles: 'graphcool-styles/dist/styles.css',
    vendor,
  },
  output: {
    filename: '[name].[hash].js',
    publicPath: '/',
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
      loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!sass-loader',
      exclude: /node_modules/,
    }, {
      test: /\.ts(x?)$/,
      loader: 'babel-loader!awesome-typescript-loader',
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }, {
      test: /\.mp3$/,
      loader: 'file-loader',
    }, {
      test: /(icons|node_modules)\/.*\.svg$/,
      loader: 'raw-loader!svgo-loader',
    }, {
      test: /graphics\/.*\.svg$/,
      loader: 'file-loader',
    }, {
      test: /(graphics|gifs)\/.*\.(png|gif)$/,
      loader: 'file-loader',
    }],
  },
  plugins: [
    new webpack.DefinePlugin({
      __BACKEND_ADDR__: JSON.stringify(process.env.BACKEND_ADDR.toString()),
      __SUBSCRIPTIONS_EU_WEST_1__: JSON.stringify(process.env.SUBSCRIPTIONS_EU_WEST_1 || "wss://dev.subscriptions.graph.cool"),
      __SUBSCRIPTIONS_US_WEST_2__: JSON.stringify(process.env.SUBSCRIPTIONS_US_WEST_1 || "wss://dev.subscriptions.us-west-2.graph.cool"),
      __SUBSCRIPTIONS_AP_NORTHEAST_1__: JSON.stringify(process.env.SUBSCRIPTIONS_AP_NORTHEAST_1 || "wss://dev.subscriptions.ap-northeast-1.graph.cool"),
      __HEARTBEAT_ADDR__: false,
      __AUTH0_DOMAIN__: '"graphcool-customers-dev.auth0.com"',
      __AUTH0_CLIENT_ID__: '"2q6oEEGaIPv45R7v60ZMnkfAgY49pNnm"',
      __METRICS_ENDPOINT__: false,
      __GA_CODE__: false,
      __INTERCOM_ID__: '"rqszgt2h"',
      __STRIPE_PUBLISHABLE_KEY__: '"pk_test_BpvAdppmXbqmkv8NQUqHRplE"',
      __CLI_AUTH_TOKEN_ENDPOINT__: JSON.stringify(process.env.CLI_AUTH_TOKEN_ENDPOINT || "https://cli-auth-api.graph.cool/dev"),
      'process.env': {
        'NODE_ENV': JSON.stringify('dev'),
      },
      __EXAMPLE_ADDR__: '"https://dynamic-resources.graph.cool"',
    }),
    new HtmlWebpackPlugin({
      favicon: 'static/favicon.png',
      template: 'src/index.html',
      templateContent: templateContent(),
    }),
    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
    new webpack.optimize.CommonsChunkPlugin('vendor'),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [
          cssnano({
            autoprefixer: {
              add: true,
              remove: true,
              browsers: ['last 2 versions'],
            },
            discardComments: {
              removeAll: true,
            },
            safe: true,
          })
        ],
        svgo: {
          plugins: [
            {removeStyleElement: true},
          ],
        },
      }
    }),
    new webpack.DllReferencePlugin({
      context: '.',
      manifest: require('./dll/vendor-manifest.json'),
    }),
    // new BundleAnalyzerPlugin(),
  ],
  resolve: {
    modules: [path.resolve('./src'), 'node_modules'],
    extensions: ['.js', '.ts', '.tsx'],
  },
}

function templateContent() {
   const html = fs.readFileSync(
     path.resolve(process.cwd(), 'src/index.html')
   ).toString();

   const doc = cheerio(html);
   const body = doc.find('body');
   const dllNames = ['vendor.bundle.js']

   dllNames.forEach(dllName => body.append(`<script data-dll='true' src='/${dllName}'></script>`));

   return doc.toString();
}
