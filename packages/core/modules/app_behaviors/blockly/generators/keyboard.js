import JavaScript from "blockly/javascript";

JavaScript["keyboard_keypressed"] = function (block) {
  const key = block.getFieldValue("KEY");
  const statement = JavaScript.statementToCode(block, "STATEMENT");

  let code = "";

  if (JavaScript.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += JavaScript.injectId(JavaScript.STATEMENT_PREFIX, block);
  }

  code += `Keyboard.addEventListener("${key}", "keydown", "${statement}");\n`;

  if (JavaScript.STATEMENT_SUFFIX) {
    code =
      JavaScript.prefixLines(
        JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block),
        JavaScript.INDENT
      ) + code;
  }

  return code;
};
