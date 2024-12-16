import { javascriptGenerator as Generator } from "blockly/javascript";

Generator.forBlock["keyboard_keypressed"] = function (block) {
  const key = block.getFieldValue("KEY");
  const statement = Generator.statementToCode(block, "STATEMENT");

  let code = "";

  if (Generator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Generator.injectId(Generator.STATEMENT_PREFIX, block);
  }

  code += `Keyboard.addEventListener("${key}", "keydown", function () {\n`;
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
