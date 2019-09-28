/* eslint-disable */

const webpack = require('webpack');
const path = require("path");
const git = require('git-rev-sync');
const pckg = require('./package.json');

const BeepPlugin = require('./webpack/plugins/BeepPlugin');
const ShellPlugin = require('./webpack/plugins/ShellPlugin');
const i18nExtractPlugin = require('./webpack/plugins/i18nExtractPlugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const LIB_NAME = "metaScore";
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
        libraryExport: 'default',
        devtoolNamespace: LIB_NAME
    },
    watchOptions: {
      ignored: /src\/i18n/
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
          // Pack Sass and CSS.
          test: /\.(sa|sc|c)ss$/,
          use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  modules: 'global',
                  localIdentName: '[path][name]--[hash:base64:5]',
                  context: './src/css',
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: [
                    require('autoprefixer')(),
                  ]
                }
              },
              'sass-loader'
            ]
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          oneOf: [
            {
              // Pack SVG sprites.
              resourceQuery: /sprite/, // foo.svg?sprite
              use: [
                {
                  loader: 'svg-sprite-loader',
                  options: {
                    symbolId: filePath => path.basename(filePath, '.svg')
                  }
                }
              ]
            },
            {
              // Pack images.
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
          ],
        },
        {
          // Pack fonts files.
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                context: './src',
                name: '[path][name].[ext]'
              }
            }
          ]
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
        templates: './src/i18n',
      }),
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
