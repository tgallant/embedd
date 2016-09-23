/* global require, module, __dirname */

'use strict'

const bourbon = require('node-bourbon')
const neat = require('node-neat')

module.exports = {
  entry: './src/app.js',
  output: {
    path: './dist/',
    filename: 'embedd.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel?presets[]=es2015' },
      { test: /\.scss$/, loaders: [ 'style', 'css', 'sass' ] },
      { test: /\.html$/, loader: 'html-loader?minimize=false' }
    ]
  },
  sassLoader: {
    includePaths: bourbon.with(neat.includePaths)
  }
}
