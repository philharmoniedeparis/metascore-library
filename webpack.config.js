/* eslint-disable */

const webpack = require('webpack');
const path = require('path');
const git = require('git-rev-sync');
const filenamify = require('filenamify');
const glob = require('glob');
const browserslist = require('browserslist');
const pckg = require('./package.json');

const BeepPlugin = require('./webpack/plugins/BeepPlugin');
const ShellPlugin = require('./webpack/plugins/ShellPlugin');
const i18nExtractPlugin = require('./webpack/plugins/i18nExtractPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const LIB_NAME = "metaScore";

const getConfigs = (entry_id, env, argv) => {
    const entry = {};
    switch (entry_id) {
        case 'Player':
            entry['Player'] = ['classlist-polyfill'].concat(glob.sync('./polyfills/*.js')).concat(['./src/js/Player']);
            entry['API'] = ['classlist-polyfill', './polyfills/NodeList.forEach.js', './polyfills/Fullscreen.js', './src/js/API'];
            break;
        case 'Editor':
            entry['Editor'] = ['./polyfills/GeomertyUtils.js', './src/js/Editor'];
            break;
    }

    const browsers = browserslist.findConfig('./')[entry_id];

    const configs = {
        mode: 'production',
        bail: !argv.watch,
        output: {
            filename: LIB_NAME + '.[name].js',
            path: path.join(__dirname, "dist"),
            library: LIB_NAME,
            libraryTarget: 'var',
            devtoolNamespace: LIB_NAME
        },
        entry: entry,
        target: `browserslist:${entry_id}`,
        devtool: "source-map",
        watchOptions: {
            ignored: /src\/i18n/
        },
        module: {
            rules: [
                {
                    // Transpile JS code.
                    test: /\.js$/,
                    include: [
                        path.resolve(__dirname, "./src/js"),
                        path.resolve(__dirname, "./polyfills"),
                        path.resolve(__dirname, "./node_modules/geometry-polyfill"),
                        path.resolve(__dirname, "./node_modules/waveform-data"),
                    ],
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                plugins: [
                                    "@babel/plugin-syntax-dynamic-import",
                                    "@babel/plugin-proposal-class-properties"
                                ],
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        {
                                            useBuiltIns: "usage",
                                            corejs: "3.7.0",
                                            modules: "amd",
                                            targets: browsers
                                        }
                                    ]
                                ]
                            }
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
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: './',
                                modules: {
                                    namedExport: true
                                }
                            }
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    mode: 'global',
                                    localIdentName: LIB_NAME + '-[path][name]--[hash:base64:5]',
                                    localIdentContext: path.resolve(__dirname, './src/css'),
                                    namedExport: true
                                },
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        ['postcss-preset-env', {
                                            browsers: browsers.join(","),
                                        }],
                                    ],
                                },
                            },
                        },
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    oneOf: [
                        {
                            // Pack SVG sprites.
                            resourceQuery: /svg-sprite/, // foo.svg?svg-sprite
                            use: [
                                {
                                    loader: 'svg-sprite-loader',
                                    options: {
                                        symbolId: (filePath) => {
                                            let dirname = path.dirname(filePath);
                                            dirname = path.relative('./src/img', dirname);
                                            dirname = filenamify(dirname, { replacement: '-' });
                                            const basename = path.basename(filePath, '.svg');
                                            return `${dirname}-${basename}`;
                                        }
                                    }
                                },
                                {
                                    loader: 'svgo-loader'
                                }
                            ]
                        },
                        {
                            // Pack inline SVG.
                            resourceQuery: /svg-inline/, // foo.svg?svg-inline
                            use: [
                                'svg-inline-loader',
                                'svgo-loader'
                            ]
                        },
                        {
                            // Pack images.
                            use: [
                                {
                                    loader: 'file-loader',
                                    options: {
                                        context: path.resolve(__dirname, './src'),
                                        name: '[path][name].[ext]?[contenthash]'
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
                                context: path.resolve(__dirname, './src'),
                                name: '[path][name].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new webpack.BannerPlugin(`${pckg.name} - v${pckg.version} r${git.short()}`),
            new StylelintPlugin({
                context: path.resolve(__dirname, './src'),
                config: {
                    extends: "stylelint-config-sass-guidelines",
                    plugins: [
                        "stylelint-no-unsupported-browser-features"
                    ],
                    rules: {
                        "plugin/no-unsupported-browser-features": [true, {
                            "browsers": browsers,
                            "ignorePartialSupport": true,
                            "ignore": [
                                "user-select-none",
                                "pointer-events"
                            ]
                        }],
                        "indentation": 4,
                        "max-nesting-depth": null,
                        "selector-max-compound-selectors": null,
                        "order/properties-alphabetical-order": null,
                        "selector-no-qualifying-type": null,
                        "selector-class-pattern": null
                    },
                    defaultSeverity: "warning"
                }
            }),
            new ESLintPlugin({
                overrideConfig: {
                    rules: {
                        "compat/compat": ["error", browsers.join(",")],
                    }
                }
            }),
            new MiniCssExtractPlugin({
                filename: LIB_NAME + '.[name].css'
            }),
            new i18nExtractPlugin({
                test: /^src[\/\\].*\.js$/,
                exclude: /node_modules/,
                regexp: /Locale\.t\(\s*?(["'])((?:(?=(\\?))\3.)*?)\1,\s*?(["'])((?:(?=(\\?))\6.)*?)\4/gm,
                fn: (matches) => {
                    return {
                        'key': matches[2],
                        'value': matches[5]
                    };
                },
                templates: glob.sync(`./src/i18n/${entry_id}.*.json`),
                path: './i18n',
            }),
            new BeepPlugin()
        ]
    };

    if (env && 'copy' in env) {
        configs.plugins.push(
            new ShellPlugin({
                onBuildExit: [
                    `copyfiles -u 1 "dist/**/*" ${env.copy} && echo "Copyied files to ${env.copy}"`
                ]
            })
        );
    }

    return configs;
};

module.exports = (env, argv) => {
    return [
        getConfigs('Player', env, argv),
        getConfigs('Editor', env, argv),
    ];
};
