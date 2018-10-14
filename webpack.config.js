/* eslint-disable */

const path = require("path");
const git = require('git-rev-sync');
const beep = require('beepbeep');
const pckg = require('./package.json');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const LIB_NAME = pckg.name;
const DIST = path.join(__dirname, "dist");

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
  }
}

module.exports = {
    mode: 'production',
    bail: true,
    entry: {
        Player: ['babel-polyfill', 'classlist-polyfill', './src/js/polyfills', './src/js/Player'],
        Editor: ['babel-polyfill', 'classlist-polyfill', './src/js/polyfills', './src/js/Editor'],
        API: ['classlist-polyfill', './src/js/polyfills', './src/js/API']
    },
    devtool: "source-map",
    output: {
        filename: LIB_NAME +'.[name].js',
        path: DIST,
        library: [LIB_NAME, "[name]"],
        libraryTarget: 'var',
        libraryExport: 'default'
    },
    watchOptions: {
      ignored: /src\/i18n/
    },
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: [
            {
              loader: 'worker-loader',
              options: {
                inline: true
              }
            }
          ]
        },
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
          test: /\.(css|less)$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: () => [
                    require('autoprefixer')({
                      browsers: ['last 4 versions']
                    })
                  ]
                }
              },
              'less-loader'
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
      ]
    },
    plugins: [
      new CleanWebpackPlugin(DIST),
      new ExtractTextPlugin({
        filename: LIB_NAME +'.[name].css'
      }),
      new ShellPlugin({
        //onBuildEnd: [],
        onBuildExit: [
          'echo "Extracting i18n" && npm run i18n && echo "Copying files to Drupal" && npm run drupal'
        ]
      }),
      new CopyWebpackPlugin([{
        from: './src/i18n/',
        to: './i18n/'
      }]),
      new BeepPlugin()
    ]
  };