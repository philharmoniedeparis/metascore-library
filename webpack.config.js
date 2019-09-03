/* eslint-disable */

const webpack = require('webpack');
const path = require("path");
const git = require('git-rev-sync');
const pckg = require('./package.json');

const BeepPlugin = require('./webpack/plugins/BeepPlugin');
const ShellPlugin = require('./webpack/plugins/ShellPlugin');
const i18nExtractPlugin = require('./webpack/plugins/i18nExtractPlugin');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const LIB_NAME = pckg.name;
const DIST_DIR = path.join(__dirname, "dist");

module.exports = (env, argv) => {
  const configs = {
    mode: 'production',
    bail: true,
    entry: {
        Player: ['@babel/polyfill', 'classlist-polyfill', './src/js/polyfills', './src/js/Player'],
        Editor: ['@babel/polyfill', 'classlist-polyfill', './src/js/polyfills', './src/js/Editor'],
        API: ['classlist-polyfill', './src/js/polyfills', './src/js/API']
    },
    devtool: "source-map",
    output: {
        filename: LIB_NAME +'.[name].js',
        path: DIST_DIR,
        library: [LIB_NAME, "[name]"],
        libraryTarget: 'var',
        libraryExport: 'default'
    },
    watchOptions: {
      ignored: /src\/i18n/
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    module: {
      rules: [
        {
          // Lint JS files.
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
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
          // Compiles Less to CSS.
          test: /\.less$/,
          use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  modules: 'global',
                  importLoaders: 2,
                  context: './src/css',
                  localIdentName: '[path][name]--[hash:base64:5]'
                }
              },
              'postcss-loader',
              'less-loader'
            ]
        },
        {
          // Pack images.
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
                disable: true,
              },
            },
          ],
        }
      ]
    },
    plugins: [
      new webpack.BannerPlugin(`${pckg.name} - v${pckg.version} r${git.short()}`),
      new MiniCssExtractPlugin({
        filename: LIB_NAME +'.[name].css'
      }),
      new i18nExtractPlugin({
        test: /^src\\.*\.js$/,
        exclude: /node_modules/,
        regexp: /Locale\.t\((["'])((?:(?=(\\?))\3.)*?)\1, ?(["'])((?:(?=(\\?))\6.)*?)\4/gm,
        fn: (matches) => {
          return {
            'key': matches[2],
            'value': matches[5]
          };
        },
        templates: './src/i18n'
      }),
      new CleanWebpackPlugin(DIST_DIR),
      new CopyWebpackPlugin([{
        from: './src/i18n/',
        to: './i18n/'
      }]),
      new BeepPlugin()
    ]
  };

  switch(argv.mode){
    case 'development':
      configs.plugins.push(
        new ShellPlugin({
          onBuildExit: [
            'echo "Copying files to Drupal" && npm run drupal'
          ]
        })
      );
      break;
  }

  return configs;
};
