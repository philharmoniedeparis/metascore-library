import { javascriptGenerator as Generator, Order } from "blockly/javascript";

Generator.forBlock["app_startup"] = function (block) {
  const statement = Generator.statementToCode(block, "STATEMENT");

  let code = "";

  if (Generator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block. Add manually.
    code += Generator.injectId(Generator.STATEMENT_PREFIX, block);
  }

  code += statement + "\n";

  code += `App.addResetCallback(function () {\n`;
  code += statement;
  code += "});\n";

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
  const code = `App.toggleFullscreen(true);\n`;
  return code;
};

Generator.forBlock["app_exit_fullscreen"] = function () {
  const code = `App.toggleFullscreen(false);\n`;
  return code;
};

Generator.forBlock["app_toggle_fullscreen"] = function () {
  const code = `App.toggleFullscreen();\n`;
  return code;
};

Generator.forBlock["app_get_idle_time"] = function () {
  const code = "App.getIdleTime()";
  return [code, Order.FUNCTION_CALL];
};

Generator.forBlock["app_reset"] = function () {
  const code = `App.reset();\n`;
  return code;
};
