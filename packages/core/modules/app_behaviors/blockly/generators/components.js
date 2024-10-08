import { javascriptGenerator as Generator, Order } from "blockly/javascript";

Generator.forBlock["components_component"] = function (block) {
  const component = block.getFieldValue("COMPONENT");
  return [`"${component}"`, Order.ATOMIC];
};

Generator.forBlock["components_behaviour_trigger"] = function (block) {
  const trigger = block.getFieldValue("TRIGGER");
  return [`"BehaviorTrigger:${trigger}"`, Order.ATOMIC];
};

Generator.forBlock["components_set_scenario"] = function (block) {
  const component = Generator.valueToCode(block, "COMPONENT", Order.ATOMIC);
  if (!component) return "";

  const code = `Components.setScenario(${component});\n`;
  return code;
};

Generator.forBlock["components_get_property"] = function (block) {
  const component = Generator.valueToCode(block, "COMPONENT", Order.ATOMIC);
  if (!component) return "";

  const property = block.getFieldValue("PROPERTY");

  const code = `Components.getProperty(${component}, "${property}")`;

  return [code, Order.FUNCTION_CALL];
};

Generator.forBlock["components_set_property"] = function (block) {
  const component = Generator.valueToCode(block, "COMPONENT", Order.ATOMIC);
  if (!component) return "";

  const property = block.getFieldValue("PROPERTY");
  const value = Generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";

  const code = `Components.setProperty(${component}, "${property}", ${value});\n`;
  return code;
};

Generator.forBlock["components_get_block_page"] = function (block) {
  const component = Generator.valueToCode(block, "COMPONENT", Order.ATOMIC);
  if (!component) return ["null", Order.ATOMIC];

  const code = `Components.getBlockPage(${component})`;
  return [code, Order.ADDITION];
};

Generator.forBlock["components_set_block_page"] = function (block) {
  const component = Generator.valueToCode(block, "COMPONENT", Order.ATOMIC);
  if (!component) return "";

  const index = Generator.valueToCode(block, "INDEX", Order.ASSIGNMENT) || "0";

  const code = `Components.setBlockPage(${component}, ${index});\n`;
  return code;
};
