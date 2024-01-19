const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  CKEditorTranslationsPlugin,
} = require("@ckeditor/ckeditor5-dev-translations");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { NormalModuleReplacementPlugin } = require("webpack");
const { styles } = require("@ckeditor/ckeditor5-dev-utils");

module.exports = defineConfig({
  lintOnSave: true,
  publicPath: "./dist/",
  transpileDependencies: true,
  parallel: false, //see https://github.com/ckeditor/ckeditor5-vue/issues/136#issuecomment-669916603
  devServer: {
    host: process.env.DEV_SERVER_HOST || "local-ip",
    port: process.env.DEV_SERVER_PORT || "auto",
    proxy: process.env.DEV_SERVER_PROXY
      ? {
          "^/": {
            target: process.env.DEV_SERVER_PROXY,
            ws: false,
          },
        }
      : null,
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @import "@metascore-library/core/scss/_mixins.scss";
        `,
      },
    },
    extract: {
      filename: "[name].css",
      chunkFilename: function () {
        return "metaScore.[name].[chunkhash].chunk.css";
      },
    },
  },
  chainWebpack: (config) => {
    // Override entry points.
    config.entryPoints.clear();
    config.entry("metaScore.Player").add("./packages/player/index.js").end();
    config
      .entry("metaScore.API")
      .add("./packages/player/modules/api/entry.js")
      .end();
    config.entry("metaScore.Editor").add("./packages/editor/index.js").end();

    // Override output options.
    config.output
      .library({
        name: "metaScore",
        type: "assign-properties",
      })
      .filename("[name].js");

    const isDevServer = process.env.WEBPACK_SERVE;
    if (isDevServer) {
      // Override HTML output.
      config.plugin("html").tap((args) => {
        args[0].title = "metaScore-library - Editor";
        args[0].chunks = ["metaScore.Editor"];
        args[0].XCSRFToken = process.env.AJAX_XCSRFToken;
        return args;
      });
      config.plugin("player-html").use(HtmlWebpackPlugin, [
        {
          ...config.plugin("html").get("args")[0],
          title: "metaScore-library - Player",
          filename: "player.html",
          chunks: ["metaScore.Player"],
        },
      ]);
    }

    // Declare custom elements.
    // See https://vuejs.org/guide/extras/web-components.html#example-vue-cli-config
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => ({
        ...options,
        compilerOptions: {
          isCustomElement: (tag) => tag === "timecode-input",
        },
      }));

    // See https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
    config.plugin("define").tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        __VUE_I18N_FULL_INSTALL__: false,
        __VUE_I18N_LEGACY_API__: true,
        __INTLIFY_PROD_DEVTOOLS__: false,
      });
      return definitions;
    });

    // Copy blockly media
    config.plugin("blockly-media").use(CopyWebpackPlugin, [
      {
        patterns: [
          {
            from: path.resolve(
              path.dirname(require.resolve("blockly")),
              "media"
            ),
            to: "blockly/media/",
          },
        ],
      },
    ]);

    // Add inline SVGs support.
    config.module.rule("svg").resourceQuery({ not: [/inline/] });
    config.module
      .rule("inline-svg")
      .test(/\.(svg)(\?.*)?$/)
      .resourceQuery(/inline/)
      .type("javascript/auto")
      .use("vue-loader")
      .loader("vue-loader")
      .end()
      .use("vue-svg-loader")
      .loader("vue-svg-loader")
      .end();
    // Add raw SVGs support.
    config.module
      .rule("raw-svg")
      .test(/\.(svg)(\?.*)?$/)
      .resourceQuery(/raw/)
      .type("asset/source")
      .end();

    // Setup i18n loader.
    // See https://vue-i18n.intlify.dev/guide/advanced/sfc.html#vue-cli
    config.module
      .rule("i18n")
      .resourceQuery(/blockType=i18n/)
      .type("javascript/auto")
      .use("i18n")
      .loader("@intlify/vue-i18n-loader")
      .end();

    // Setup CKEditor.
    // See https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/vuejs-v3.html#using-ckeditor-from-source
    config.plugin("ckeditor").use(CKEditorTranslationsPlugin, [
      {
        language: "fr",
        additionalLanguages: ["en"],
        buildAllTranslationsToSeparateFiles: true,
        outputDirectory: "translations/ckeditor",
        verbose: true,
      },
    ]);
    config
      .plugin("ckeditor-icons")
      .use(NormalModuleReplacementPlugin, [
        /ckeditor5-link\/theme\/icons\/unlink\.svg/,
        path.join(
          __dirname,
          "packages/editor/modules/component_form/ckeditor/plugins/ckeditor5-link/theme/icons/unlink.svg"
        ),
      ]);
    config.module
      .rule("svg")
      .exclude.add(path.join(__dirname, "node_modules/@ckeditor"))
      .add(
        path.join(__dirname, "packages/editor/modules/component_form/ckeditor")
      );
    config.module
      .rule("cke-svg")
      .test(/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/)
      .use("raw-loader")
      .loader("raw-loader");
    config.module
      .rule("cke-css")
      .test(/ckeditor5-[^/\\]+[/\\].+\.css$/)
      .use("postcss-loader")
      .loader("postcss-loader")
      .options({
        postcssOptions: styles.getPostCssConfig({
          themeImporter: {
            themePath: require.resolve("@ckeditor/ckeditor5-theme-lark"),
          },
          minify: true,
        }),
      });
  },
});
