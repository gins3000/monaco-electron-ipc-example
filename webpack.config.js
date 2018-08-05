const path = require('path');
const outDir = path.resolve(__dirname, "dist/frontend");

module.exports = {
  mode: "development",
  entry: "./dist/frontend/index.js",
  output: {
    filename: '[name].bundle.js',
    path: outDir
  },
  target: 'electron-renderer',
  resolve: {
    alias: {
      'vscode': require.resolve('monaco-languageclient/lib/vscode-compatibility')
    }
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      enforce: 'pre',
      loader: 'source-map-loader'
    }]
  }
}
