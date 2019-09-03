class ShellPlugin{
    constructor(options){
      this.options = options;
    }

    apply(compiler){
      var exec = require('child_process').exec;

      if('onBuildStart' in this.options){
        compiler.hooks.compilation.tap('ShellPlugin', (compilation) => {
          this.options.onBuildStart.forEach((script) => {
            exec(script, (err, stdout, stderr) => {
              if (stdout) process.stdout.write(stdout);
              if (stderr) process.stderr.write(stderr);
            });
          });

          this.options.onBuildStart = [];
        });
      }

      if('onBuildExit' in this.options){
        compiler.hooks.done.tap('ShellPlugin', (compilation) => {
          this.options.onBuildExit.forEach((script) => {
            exec(script, (err, stdout, stderr) => {
              if (stdout) process.stdout.write(stdout);
              if (stderr) process.stderr.write(stderr);
            });
          });
        });
      }

      if('onBuildEnd' in this.options){
        compiler.hooks.afterEmit.tap('ShellPlugin', (compilation) => {
          this.options.onBuildEnd.forEach((script) => {
            exec(script, (err, stdout, stderr) => {
              if (stdout) process.stdout.write(stdout);
              if (stderr) process.stderr.write(stderr);
            });
          });

          this.options.onBuildEnd = [];
        });
      }
    }
  }

  module.exports = ShellPlugin;