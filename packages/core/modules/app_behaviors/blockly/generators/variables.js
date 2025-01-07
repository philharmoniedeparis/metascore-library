import { javascriptGenerator as Generator, Order } from "blockly/javascript";

Generator.forBlock["lists_get"] = function (block) {
  const code = Generator.getVariableName(block.getFieldValue("VAR"));
  return [code, Order.ATOMIC];
};

Generator.forBlock["lists_set"] = function (block) {
  const varName = Generator.getVariableName(block.getFieldValue("VAR"));
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = Generator.valueToCode(block, "ADD" + i, Order.NONE) || "null";
  }
  return varName + " = [" + elements.join(", ") + "];\n";
};

Generator.forBlock["lists_add"] = function (block) {
  const varName = Generator.getVariableName(block.getFieldValue("VAR"));
  const element = Generator.valueToCode(block, "ITEM", Order.NONE) || "null";
  return varName + ".push(" + element + ");\n";
};

Generator.forBlock["lists_empty"] = function (block) {
  const varName = Generator.getVariableName(block.getFieldValue("VAR"));
  return varName + " = [];\n";
};
