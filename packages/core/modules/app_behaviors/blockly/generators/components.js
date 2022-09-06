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

JavaScript["components_set_scenario"] = function (block) {
  const id = block.getFieldValue("SCENARIO");
  const code = `Components.setScenario("${id}");`;
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

JavaScript["components_get_property"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");
  const property = block.getFieldValue("PROPERTY");

  const code = `Components.getProperty("${type}", "${id}", "${property}")`;

  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript["components_set_property"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");
  const property = block.getFieldValue("PROPERTY");
  const value =
    JavaScript.valueToCode(block, "VALUE", JavaScript.ORDER_ASSIGNMENT) || "0";

  const code = `Components.setProperty("${type}", "${id}", "${property}", ${value});`;

  return code;
};

JavaScript["components_get_background"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");

  const code = `Components.getProperty("${type}", "${id}", "background")`;

  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript["components_set_background"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");
  const value =
    JavaScript.valueToCode(block, "VALUE", JavaScript.ORDER_ASSIGNMENT) || "0";

  const code = `Components.setProperty("${type}", "${id}", "background", ${value});`;

  return code;
};

JavaScript["components_get_text"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");

  const code = `Components.getProperty("${type}", "${id}", "text")`;

  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript["components_set_text"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");
  const value =
    JavaScript.valueToCode(block, "VALUE", JavaScript.ORDER_ASSIGNMENT) || "0";

  const code = `Components.setProperty("${type}", "${id}", "text", ${value});`;

  return code;
};
