const path = require("path");

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  lintOnSave: true,
  publicPath: "./",
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.output.library({
      name: "metaScore",
      type: "assign-properties",
    });

    const svgRule = config.module.rule("svg");
    svgRule.uses.clear();
    svgRule
      .oneOf("inline")
      .resourceQuery(/inline/)
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

    const fontsRule = config.module.rule("fonts");
    fontsRule.uses.clear();
    fontsRule
      .use("file-loader")
      .loader("file-loader")
      .options({
        context: path.resolve(__dirname, "./src"),
        name: "[path][name].[ext]",
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
