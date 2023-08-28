import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { EMPTY_OPTION } from "../constants";

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
  const [, id] = block.getFieldValue("COMPONENT").split(":");
  const code = `Components.setScenario("${id}");`;
  return code;
};

JavaScript["components_get_property"] = function (block) {
  const component = block.getFieldValue("COMPONENT");
  if (component === EMPTY_OPTION) {
    return "";
  }

  const [type, id] = component.split(":");
  const property = block.getFieldValue("PROPERTY");

  const code = `Components.getProperty("${type}", "${id}", "${property}")`;

  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript["components_set_property"] = function (block) {
  const component = block.getFieldValue("COMPONENT");
  if (component === EMPTY_OPTION) {
    return "";
  }

  const [type, id] = component.split(":");
  const property = block.getFieldValue("PROPERTY");
  const value =
    JavaScript.valueToCode(block, "VALUE", JavaScript.ORDER_ASSIGNMENT) || "0";

  const code = `Components.setProperty("${type}", "${id}", "${property}", ${value});`;

  return code;
};

JavaScript["components_get_block_page"] = function (block) {
  const [, id] = block.getFieldValue("COMPONENT").split(":");

  const code = `Components.getBlockPage("${id}") + 1`;

  return [code, JavaScript.ORDER_ADDITION];
};

JavaScript["components_set_block_page"] = function (block) {
  const [, id] = block.getFieldValue("COMPONENT").split(":");
  const index =
    JavaScript.valueToCode(block, "INDEX", JavaScript.ORDER_ASSIGNMENT) || "0";

  const code = `Components.setBlockPage("${id}", ${index} - 1);`;

  return code;
};
