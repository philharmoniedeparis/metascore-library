/* eslint-disable */

const webpack = require('webpack');
const path = require("path");
const git = require('git-rev-sync');
const beep = require('beepbeep');
const pckg = require('./package.json');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const LIB_NAME = pckg.name;
const DIST_DIR = path.join(__dirname, "dist");

class BeepPlugin{
  apply(compiler){
    compiler.hooks.done.tap('BeepPlugin', (stats) => {
      if(stats.compilation.errors && stats.compilation.errors.length){
        beep(2);
      }
      else{
        beep();
      }
    });
  }
}

class ShellPlugin{
  constructor(options){
    this.options = options;
  }

  apply(compiler){
    var exec = require('child_process').exec;

    if('onBuildStart' in this.options){
      compiler.hooks.compilation.tap('ShellPlugin', (compilation) => {
        this.options.onBuildStart.forEach((script) => {
          exec(script, (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });

        this.options.onBuildStart = [];
      });
    }

    if('onBuildExit' in this.options){
      compiler.hooks.done.tap('ShellPlugin', (compilation) => {
        this.options.onBuildExit.forEach((script) => {
          exec(script, (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });
      });
    }

    if('onBuildEnd' in this.options){
      compiler.hooks.afterEmit.tap('ShellPlugin', (compilation) => {
        this.options.onBuildEnd.forEach((script) => {
          exec(script, (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });

        this.options.onBuildEnd = [];
      });
    }
  }
}

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
      new CleanWebpackPlugin(DIST_DIR),
      new CopyWebpackPlugin([{
        from: './src/i18n/',
        to: './i18n/'
      }]),
      new BeepPlugin(),
      new ShellPlugin({
        onBuildExit: [
          'echo "Extracting i18n" && npm run i18n'
        ]
      })
    ]
  };

  switch(argv.mode){
    case 'development':
      if('copy' in argv) {
        configs.plugins.push(
          new ShellPlugin({
            onBuildExit: [
              `copyfiles -u 1 dist/**/* ${argv.copy} && echo "Copyied files to ${argv.copy}"`
            ]
          })
        );
      }
      break;
  }

  return configs;
};
