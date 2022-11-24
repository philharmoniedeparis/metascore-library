import { javascriptGenerator as JavaScript } from "blockly/javascript";

JavaScript["app_startup"] = function (block) {
  const statement = JavaScript.statementToCode(block, "STATEMENT");

  let code = "";

  if (JavaScript.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += JavaScript.injectId(JavaScript.STATEMENT_PREFIX, block);
  }

  code += statement;

  if (JavaScript.STATEMENT_SUFFIX) {
    code =
      JavaScript.prefixLines(
        JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block),
        JavaScript.INDENT
      ) + code;
  }

  return code;
};

JavaScript["app_enter_fullscreen"] = function () {
  const code = `App.toggleFullscreen(true);`;
  return code;
};

JavaScript["app_exit_fullscreen"] = function () {
  const code = `App.toggleFullscreen(false);`;
  return code;
};

JavaScript["app_toggle_fullscreen"] = function () {
  const code = `App.toggleFullscreen();`;
  return code;
};
