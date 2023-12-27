import { javascriptGenerator as Generator } from "blockly/javascript";

Generator.forBlock["app_startup"] = function (block) {
  const statement = Generator.statementToCode(block, "STATEMENT");

  let code = "";

  if (Generator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Generator.injectId(Generator.STATEMENT_PREFIX, block);
  }

  code += statement;

  if (Generator.STATEMENT_SUFFIX) {
    code =
      Generator.prefixLines(
        Generator.injectId(Generator.STATEMENT_SUFFIX, block),
        Generator.INDENT
      ) + code;
  }

  return code;
};

Generator.forBlock["app_enter_fullscreen"] = function () {
  const code = `App.toggleFullscreen(true);`;
  return code;
};

Generator.forBlock["app_exit_fullscreen"] = function () {
  const code = `App.toggleFullscreen(false);`;
  return code;
};

Generator.forBlock["app_toggle_fullscreen"] = function () {
  const code = `App.toggleFullscreen();`;
  return code;
};
