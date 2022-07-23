import JavaScript from "blockly/javascript";

JavaScript["mediatime_get"] = function () {
  const code = "MediaTime.get()";
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript["mediatime_set"] = function (block) {
  const value =
    JavaScript.valueToCode(block, "VALUE", JavaScript.ORDER_ASSIGNMENT) || "0";
  const code = `MediaTime.set(${value});`;
  return code;
};
