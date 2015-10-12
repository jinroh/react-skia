/* eslint-env node */
var webpack = require("webpack");

module.exports = {
  module: {
    loaders: [
      { test: /\.js$/, loader: "babel?loose=all" },
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      "__DEV__": process.env.NODE_ENV === "development",
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development")
      }
    }),
  ]
};
