/*global require, module, __dirname*/

var path = require('path'),
		bourbon = require('node-bourbon'),
		neat = require('node-neat');

module.exports = {
  entry: './src/app.js',
  output: {
    path: './dist/',
    filename: 'embedd.js'
  },
  module: {
    loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel?presets[]=es2015'},
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader!' },
			{ test: /\.html$/, loader: 'html-loader?minimize=false' }
    ]
  },
	sassLoader: {
		includePaths: bourbon.with(neat.includePaths)
	}
};
