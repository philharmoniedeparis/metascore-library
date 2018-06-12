const path = require("path");
const webpack = require("webpack");
const git = require('git-rev-sync');
const pckg = require('./package.json');

const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const LIB_NAME = pckg.name;
const DIST = path.join(__dirname, "dist");

module.exports = {
    mode: 'production',
    entry: {
        Player: './src/js/Player',
        Editor: './src/js/Editor',
        API: './src/js/API'
    },
    devtool: "source-map",
    output: {
        //filename: LIB_NAME +'.[name].js',
        filename: (data) => {
          return `${LIB_NAME}.${data.chunk.name.toLowerCase()}.min.js`;
        },
        path: DIST,
        library: [LIB_NAME, "[name]"],
        libraryTarget: 'var',
        libraryExport: 'default'
    },
    module: {
      rules: [
        {
           // Lint JS files
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader"
            },
            {
              loader: "eslint-loader",
              options: {
                failOnWarning: false,
                failOnError: true,
              },
            },
            {
              loader: 'string-replace-loader',
              options: {
                multiple: [
                  {
                    search: '[[VERSION]]',
                    replace: pckg.version,
                  },
                  {
                    search: '[[REVISION]]',
                    replace: git.short(),
                  },
                ]
              }
            }
          ],
        },
        {
           // compiles Less to CSS
          test: /\.less$/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              {
                loader: 'css-loader'
              },
              {
                loader: 'less-loader'
              },
            ],
          })
        },
        {
          // pack images
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                context: './src',
                name: '[path][name].[ext]?[hash]'
              }
            },
            {
              loader: 'image-webpack-loader',
              options: {
                bypassOnDebug: true, // webpack@1.x
                disable: true, // webpack@2.x and newer
              },
            },
          ],
        }
      ],
    },
    plugins: [
      new CleanWebpackPlugin(DIST),
      new ExtractTextPlugin({
        //filename: LIB_NAME +'.[name].css'
        filename: (getPath) => {
          return getPath(LIB_NAME +'.[name].min.css').toLowerCase();
        }
      }),
      new WebpackShellPlugin({
        onBuildEnd: ['node ./bin/i18n-extract.js']
      }),
      new CopyWebpackPlugin([{
        from: './src/i18n/',
        to: './i18n/'
      }])
    ]
  };