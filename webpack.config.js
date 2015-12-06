var path = require('path');

module.exports = {
  entry: "./src/app.js",
  output: {
    path: "./dist/",
    filename: "embedd.js"
  },
  module: {
    loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: "babel?presets[]=es2015"},
      { test: /\.scss$/, loader: "style-loader!css-loader!sass-loader!" },
			{ test: /\.html$/, loader: "html-loader?minimize=false" }
    ]
  }
};
