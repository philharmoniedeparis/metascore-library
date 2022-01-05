const path = require("path");

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  lintOnSave: true,
  publicPath: "./",
  transpileDependencies: true,
  css: {
    extract: {
      filename: "[name].css",
      chunkFilename: function () {
        return "metaScore.[name].chunk.css";
      },
      insert: function (linkTag) {
        try {
          var href = linkTag.getAttribute("href");
          if (href.includes("Editor.PlayerPreviewIframe")) {
            // Alter the link tag to prevent it from affecting the main page,
            // and allow the editor to insert it at the correct location.
            linkTag.setAttribute("rel", "preload");
            linkTag.setAttribute("as", "style");
            linkTag.setAttribute("id", "player-preview-iframe");
          }
        } catch (e) {
          //
        }

        document.head.appendChild(linkTag);
      },
    },
  },
  chainWebpack: (config) => {
    // Override entry points.
    config.entryPoints.clear();
    config.entry("metaScore.Player").add("./src/player.js").end();
    config.entry("metaScore.Editor").add("./src/editor.js").end();

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

    // Override svg rule to add inline SVGs.
    const svgRule = config.module.rule("svg");
    svgRule.uses.clear();
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
      .end()
      .oneOf("external")
      .use("file-loader")
      .loader("file-loader")
      .options({
        context: path.resolve(__dirname, "./src"),
        name: "[path][name].[ext]?[contenthash]",
      });

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
};
