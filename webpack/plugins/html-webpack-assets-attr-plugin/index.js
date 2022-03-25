const HtmlWebpackPlugin = require("html-webpack-plugin");

class HtmlWebpackAssetsAttrPlugin {
  constructor({ attrs }) {
    this.attrs = attrs;
  }

  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.compilation.tap("HtmlAssetsAttrPlugin", (compilation) => {
        const hooks = HtmlWebpackPlugin.getHooks(compilation);
        hooks.alterAssetTags.tapAsync(
          "HtmlAssetsAttrPlugin",
          (data, callback) => {
            data.assetTags.scripts = this._transformAssets(
              data.assetTags.scripts
            );
            data.assetTags.styles = this._transformAssets(
              data.assetTags.styles
            );
            data.assetTags.meta = this._transformAssets(data.assetTags.meta);

            return callback(null, data);
          }
        );
      });
    }
  }

  _transformAssets(assets) {
    return assets.map((asset) => {
      const attributes = this.attrs(asset);
      if (attributes) {
        asset.attributes = {
          ...asset.attributes,
          ...attributes,
        };
      }
      return asset;
    });
  }
}

module.exports = HtmlWebpackAssetsAttrPlugin;
