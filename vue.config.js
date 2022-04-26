const { defineConfig } = require("@vue/cli-service");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackAssetsAttrPlugin = require("./webpack/plugins/html-webpack-assets-attr-plugin");

module.exports = defineConfig({
  lintOnSave: true,
  publicPath: "./",
  transpileDependencies: true,
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
        return "metaScore.[name].chunk.css";
      },
    },
  },
  chainWebpack: (config) => {
    // Add the "data-metascore" attribute to all link tags
    // to be used by the app_preview module.
    config.plugin("htmllinkattr").use(HtmlWebpackAssetsAttrPlugin, [
      {
        attrs(asset) {
          if (asset.tagName === "link") {
            return {
              "data-metascore": true,
            };
          }
        },
      },
    ]);

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
      .chunkFilename("metaScore.[name].chunk.js");

    // Add inline SVGs support.
    const svgRule = config.module.rule("svg");
    svgRule
      .oneOf("inline")
      .resourceQuery(/inline/)
      .type("javascript/auto")
      .use("vue-loader")
      .loader("vue-loader")
      .end()
      .use("vue-svg-loader")
      .loader("vue-svg-loader")
      .end()
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
  },
});
