const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackAssetsAttrPlugin = require("./webpack/plugins/html-webpack-assets-attr-plugin");
const CKEditorWebpackPlugin = require("@ckeditor/ckeditor5-dev-webpack-plugin");
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
          @import "@metascore-library/core/scss/_variables.scss";
          @import "@metascore-library/core/scss/_mixins.scss";
        `,
      },
    },
    extract: {
      filename: "[name].css",
      chunkFilename: function () {
        return "metaScore.[name].[chunkhash].chunk.css";
      },
      insert: function (linkTag) {
        // Insert a clone in the preview iframe.
        var preview = document.querySelector(
          ".metaScore-editor .app-preview iframe"
        );
        if (preview) {
          preview.contentDocument.head.appendChild(linkTag.cloneNode());
        }

        document.head.appendChild(linkTag);
      },
      ignoreOrder: true,
    },
  },
  chainWebpack: (config) => {
    // Override entry points.
    config.entryPoints.clear();
    config.entry("metaScore.Player").add("./packages/player/index.js").end();
    config.entry("metaScore.Editor").add("./packages/editor/index.js").end();

    // Override output options.
    config.output
      .library({
        name: "metaScore",
        type: "assign-properties",
      })
      .filename("[name].js")
      .chunkFilename("metaScore.[name].[chunkhash].chunk.js");

    // Add the "data-metascore" attribute to all link tags
    // to be used by the app_preview module.
    config.plugin("htmllinkattr").use(HtmlWebpackAssetsAttrPlugin, [
      {
        attrs(asset) {
          if (asset.tagName === "link") {
            return {
              "data-metascore-library": true,
            };
          }
        },
      },
    ]);

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

    // See https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
    config.plugin("define").tap((definitions) => {
      definitions[0] = {
        ...definitions[0],
        __VUE_I18N_FULL_INSTALL__: false,
        __VUE_I18N_LEGACY_API__: true,
        __INTLIFY_PROD_DEVTOOLS__: false,
      };
      return definitions;
    });

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
    config.plugin("ckeditor").use(CKEditorWebpackPlugin, [
      {
        language: "fr",
        additionalLanguages: ["en"],
        buildAllTranslationsToSeparateFiles: true,
        outputDirectory: "translations/ckeditor",
        chunks: ["metaScore.Editor"],
      },
    ]);
    config.module
      .rule("svg")
      .exclude.add(path.join(__dirname, "node_modules", "@ckeditor"));
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
      .tap(() => {
        return {
          postcssOptions: styles.getPostCssConfig({
            themeImporter: {
              themePath: require.resolve("@ckeditor/ckeditor5-theme-lark"),
            },
            minify: true,
          }),
        };
      });
  },
});
