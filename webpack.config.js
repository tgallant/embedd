module.exports = {
  entry: "./app.js",
  output: {
    path: './dist/',
    filename: "embedd.js"
  },
  module: {
    loaders: [
      { test: /\.scss$/, loader: "style-loader!css-loader!sass-loader!" },
			{ test: /\.html$/, loader: "html-loader" }
    ]
  }
};
