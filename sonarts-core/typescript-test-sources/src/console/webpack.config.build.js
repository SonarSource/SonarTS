const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cssnano = require('cssnano')
const path = require('path')
const config = require('./webpack.config')
const OfflinePlugin = require('offline-plugin')

module.exports = {
  devtool: 'source-map',
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
    vendor: config.entry.vendor,
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].[hash].js',
    sourceMapFilename: '[file].map',
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
    }, {
      test: /\.ts(x?)$/,
      loader: 'babel-loader!awesome-typescript-loader',
      exclude: /node_modules/,
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }, {
      test: /\.mp3$/,
      loader: 'file-loader',
    }, {
      test: /icons\/.*\.svg$/,
      loader: 'raw-loader!svgo-loader?{"plugins":[{"removeStyleElement":true}]}',
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
      __SUBSCRIPTIONS_EU_WEST_1__: JSON.stringify(process.env.SUBSCRIPTIONS_EU_WEST_1.toString()),
      __SUBSCRIPTIONS_US_WEST_2__: JSON.stringify(process.env.SUBSCRIPTIONS_US_WEST_2.toString()),
      __SUBSCRIPTIONS_AP_NORTHEAST_1__: JSON.stringify(process.env.SUBSCRIPTIONS_AP_NORTHEAST_1.toString()),
      __HEARTBEAT_ADDR__: process.env.HEARTBEAT_ADDR ? JSON.stringify(process.env.HEARTBEAT_ADDR.toString()) : false,
      __AUTH0_DOMAIN__: JSON.stringify(process.env.AUTH0_DOMAIN.toString()),
      __AUTH0_CLIENT_ID__: JSON.stringify(process.env.AUTH0_CLIENT_ID.toString()),
      __METRICS_ENDPOINT__: process.env.METRICS_ENDPOINT ? JSON.stringify(process.env.METRICS_ENDPOINT.toString()) : false,
      __GA_CODE__: process.env.GA_CODE ? JSON.stringify(process.env.GA_CODE.toString()) : false,
      __INTERCOM_ID__: '"mamayuvj"',
      __STRIPE_PUBLISHABLE_KEY__: '"pk_live_WeGxtEVBQ8j4R2PLzePTcn1l"',
      __CLI_AUTH_TOKEN_ENDPOINT__: JSON.stringify(process.env.CLI_AUTH_TOKEN_ENDPOINT.toString()),
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
      __EXAMPLE_ADDR__: '"https://dynamic-resources.graph.cool"',
    }),
    new HtmlWebpackPlugin({
      favicon: 'static/favicon.png',
      template: 'src/index.html',
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: true,
        dead_code: true,
        warnings: false,
      },
      sourceMap: true,
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
    new OfflinePlugin(),
  ],
  resolve: {
    modules: [path.resolve('./src'), 'node_modules'],
    extensions: ['.js', '.ts', '.tsx'],
  }
}
