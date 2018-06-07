const path = require("path");
const webpack = require("webpack");

module.exports = {
    mode: 'production',
    entry: {
        Player: './src/js/Player',
        Editor: './src/js/Editor'
    },
    devtool: "source-map",
    output: {
        filename: 'metaScore.[name].js',
        path: path.join(__dirname, "dist"),
        library: ["metaScore", "[name]"],
        libraryTarget: 'var',
        libraryExport: 'default'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
          options: {
            failOnWarning: false,
            failOnError: true,
          }
        },
      ],
    }
  };