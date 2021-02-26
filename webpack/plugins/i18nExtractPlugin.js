const path = require('path');
const fs = require('fs');
const { sources } = require('webpack');

const PLUGIN_ID = 'i18nExtractPlugin';

module.exports = class i18nExtractPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // Load the templates.
    this.templates = this.options.templates.reduce((accumulator, filepath) => {
      accumulator[filepath] = JSON.parse(fs.readFileSync(filepath, "utf8"));
      return accumulator;
    }, {});

    compiler.hooks.thisCompilation.tap(PLUGIN_ID, (compilation) => {
      compilation.hooks.additionalAssets.tapAsync(PLUGIN_ID, (callback) => {
        const entries = {};
        Object.keys(this.templates).forEach((key) => {
          entries[key] = {};
        });

        for (const module of compilation.modules) {
          this.processModule(module, compiler.context, entries);
        }

        this.sortEntries(entries);

        this.updateTemplates(entries);

        this.addAssets(compilation, entries);

        callback();
      });
    });
  }

  processModule(module, context, entries) {
    if(!module.resource) {
      return;
    }

    const file = module.resource;
    const filepath = path.relative(context, file);

    if (this.options.exclude && this.options.exclude.test(filepath)) {
      return;
    }

    if (this.options.test && !this.options.test.test(filepath)) {
      return;
    }

    const exracted = this.extractEntries(filepath);
    Object.entries(this.templates).forEach(([key, template]) => {
      Object.entries(exracted).forEach(([translation_key, translation_string]) => {
        entries[key][translation_key] = translation_key in template ? template[translation_key] : translation_string;
      });
    });
  }

  extractEntries(filepath) {
    const entries = {};
    const content = fs.readFileSync(filepath, "utf8");
    let matches = null;

    while ((matches = this.options.regexp.exec(content)) !== null) {
      const { key, value } = this.options.fn(matches);
      entries[key] = value;
    }

    return entries;
  }

  sortEntries(entries) {
    Object.entries(entries).forEach(([filepath, entry]) => {
      entries[filepath] = Object.keys(entry).sort().reduce((accumulator, key) => {
        accumulator[key] = entry[key];
        return accumulator;
      }, {});
    });
  }

  addAssets(compilation, entries) {
    Object.entries(entries).forEach(([filepath, entry]) => {
      // Add i18n asset.
      const basename = path.basename(filepath, '.json');
      const file = path.join(this.options.path, `${basename}.js`);
      const contents = `(function(){window.metaScoreLocale=${JSON.stringify(entry)};})();\n`;
      compilation.emitAsset(file, new sources.RawSource(contents));
    });
  }

  updateTemplates(entries) {
    Object.entries(entries).forEach(([filepath, entry]) => {
      fs.writeFileSync(filepath, JSON.stringify(entry, null, '\t'));
    });
  }
};
