import { javascriptGenerator as Generator, Order } from "blockly/javascript";
import { EMPTY_OPTION } from "../constants";

Generator.forBlock["components_click"] = function (block) {
  const [type, id] = block.getFieldValue("COMPONENT").split(":");
  const statement = Generator.statementToCode(block, "STATEMENT");

  let code = "";

  if (Generator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Generator.injectId(Generator.STATEMENT_PREFIX, block);
  }

  code += `Components.addEventListener("${type}", "${id}", "click", function () {\n`;
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

Generator.forBlock["components_set_scenario"] = function (block) {
  const [, id] = block.getFieldValue("COMPONENT").split(":");
  const code = `Components.setScenario("${id}");`;
  return code;
};

Generator.forBlock["components_get_property"] = function (block) {
  const component = block.getFieldValue("COMPONENT");
  if (component === EMPTY_OPTION) {
    return "";
  }

  const [type, id] = component.split(":");
  const property = block.getFieldValue("PROPERTY");

  const code = `Components.getProperty("${type}", "${id}", "${property}")`;

  return [code, Order.FUNCTION_CALL];
};

Generator.forBlock["components_set_property"] = function (block) {
  const component = block.getFieldValue("COMPONENT");
  if (component === EMPTY_OPTION) {
    return "";
  }

  const [type, id] = component.split(":");
  const property = block.getFieldValue("PROPERTY");
  const value = Generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";

  const code = `Components.setProperty("${type}", "${id}", "${property}", ${value});`;

  return code;
};

Generator.forBlock["components_get_block_page"] = function (block) {
  const [, id] = block.getFieldValue("COMPONENT").split(":");

  const code = `Components.getBlockPage("${id}") + 1`;

  return [code, Order.ADDITION];
};

Generator.forBlock["components_set_block_page"] = function (block) {
  const [, id] = block.getFieldValue("COMPONENT").split(":");
  const index = Generator.valueToCode(block, "INDEX", Order.ASSIGNMENT) || "0";

  const code = `Components.setBlockPage("${id}", ${index} - 1);`;

  return code;
};
