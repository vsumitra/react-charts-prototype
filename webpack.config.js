const path = require('path');
const combineLoaders = require('webpack-combine-loaders');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
  resolve: {
    modules: [
      path.resolve('./lib'),
      path.resolve('./node_modules')
    ]
  },
  entry: ['babel-polyfill', './lib/renderers/dom.js'],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [{ 
      test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' 
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract(
        'style-loader', 
        combineLoaders([{
          loader: 'css-loader',
          query: {
            modules: true,
            localIdentName: '[name]__[local]___[hash:base64:5]'
          }
        }])
      )
    }]
  },
  plugins: [
    new ExtractTextPlugin('styles.css')
  ]
};

module.exports = config;