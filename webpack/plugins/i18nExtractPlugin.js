const path = require('path');
const fs = require('fs');

class i18nExtractPlugin {
  constructor(options) {
    this.options = options;

    this.templates = this.walkSync(this.options.templates);

    this.entries = [];
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('i18nExtractPlugin', (compilation, callback) => {
      compilation.fileDependencies.forEach((filepath) => {
        const relative_filepath = path.relative(compiler.context, filepath);

        if (this.options.exclude && this.options.exclude.test(relative_filepath)) {
          return;
        }

        if (this.options.test && !this.options.test.test(relative_filepath)) {
          return;
        }

        this.extract(relative_filepath);
      });

      this.updateTemplates();

      this.templates.forEach((filepath) => {
        const filename = path.basename(filepath, '.json');
        const content = fs.readFileSync(filepath, "utf8");
        const stats = fs.statSync(filepath);

        compilation.assets[`i18n/${filename}.js`] = {
          source: function () {
            return `window.metaScoreLocale=${content};`;
          },
          size: function () {
            return stats.size;
          }
        };
      });

      callback();
    });
  }

  walkSync(dir) {
    let files = [];

    fs.readdirSync(dir).forEach((file) => {
      const file_path = path.join(dir, file);

      if (fs.lstatSync(file_path).isDirectory()) {
        files = files.concat(walkSync(file_path));
      }
      else {
        files.push(file_path);
      }
    });

    return files;
  }

  extract(filepath) {
    const content = fs.readFileSync(filepath, "utf8");
    let matches = null;

    while ((matches = this.options.regexp.exec(content)) !== null) {
      const { key, value } = this.options.fn(matches);
      this.entries[key] = value;
    }
  }

  updateTemplates() {
    this.templates.forEach((filepath) => {
      const template = JSON.parse(fs.readFileSync(filepath, "utf8"));
      const content = {};

      Object.keys(this.entries).sort().forEach((key) => {
        content[key] = key in template ? template[key] : this.entries[key];
      });

      fs.writeFileSync(filepath, JSON.stringify(content, null, '\t'));
    });
  }
}

module.exports = i18nExtractPlugin;