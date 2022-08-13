import JavaScript from "blockly/javascript";

JavaScript["components_click"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");
  const statement = JavaScript.statementToCode(block, "STATEMENT");

  let code = "";

  if (JavaScript.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += JavaScript.injectId(JavaScript.STATEMENT_PREFIX, block);
  }

  code += `Components.addEventListener("${type}", "${id}", "click", function () {\n`;
  code += statement;
  code += "});\n";

  if (JavaScript.STATEMENT_SUFFIX) {
    code =
      JavaScript.prefixLines(
        JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block),
        JavaScript.INDENT
      ) + code;
  }

  return code;
};

JavaScript["components_show"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");
  const code = `Components.show("${type}", "${id}");`;
  return code;
};

JavaScript["components_hide"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");
  const code = `Components.hide("${type}", "${id}");`;
  return code;
};
