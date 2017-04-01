/* global require, module, __dirname */

'use strict'

const path = require('path')

const bourbon = require('node-bourbon')
const neat = require('node-neat')

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'embedd.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [ 'es2015' ]
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: {
              includePaths: bourbon.with(neat.includePaths)
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: false
            }
          }
        ]
      }
    ]
  }
}
