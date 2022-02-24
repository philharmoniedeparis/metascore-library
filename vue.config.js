const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  lintOnSave: true,
  publicPath: "./",
  transpileDependencies: true,
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
      insert: function (linkTag) {
        var href = linkTag.getAttribute("href");
        if (href.includes("Editor.PlayerPreview")) {
          var preview = document.querySelector("iframe.player-preview");
          if (preview) {
            // Load CSS into iframe if available.
            preview.contentDocument.head.appendChild(linkTag);
            return;
          } else {
            // Iframe not yet mounted,
            // allow the editor to insert it at the correct location.
            linkTag.setAttribute("id", "player-preview");
            // Prevent the tag from affecting the main page,
            // while still allowing it to load to finalize the async import.
            linkTag.setAttribute("rel", "preload");
            linkTag.setAttribute("as", "style");
          }
        }

        document.head.appendChild(linkTag);
      },
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
      .chunkFilename("metaScore.[name].chunk.js");

    // Extract common dependencies to a separate chunk.
    config.optimization.splitChunks({
      cacheGroups: {
        commons: {
          name: "metaScore.commons.chunk",
          chunks: "initial",
        },
      },
    });

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
