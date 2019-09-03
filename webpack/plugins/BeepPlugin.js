const beep = require('beepbeep');

class BeepPlugin{
    apply(compiler){
      compiler.hooks.done.tap('BeepPlugin', (stats) => {
        if(stats.compilation.errors && stats.compilation.errors.length){
          beep(2);
        }
        else{
          beep();
        }
      });
    }
  }

  module.exports = BeepPlugin;