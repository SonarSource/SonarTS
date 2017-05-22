var path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src/tools/cfg_viewer/viewer.ts'),
  output: {
    filename: 'cfg_viewer_bundle.js',
    path: path.resolve(__dirname, 'lib/tools/cfg_viewer/')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  devtool: 'source-map',
  node: {
    fs: 'empty', // temporary fix for webpack support of source maps see : https://github.com/webpack-contrib/css-loader/issues/447
    module: 'empty' // temporary fix for webpack support of source maps see : https://github.com/josephsavona/valuable/issues/9
  },
  devServer: {
    contentBase: path.join(__dirname, 'src/tools/cfg_viewer'),
    compress: true
  }
};
