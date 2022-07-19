import { JavaScript } from "blockly/core";

JavaScript["mediatime_get"] = () => {
  const code = 'useModule("media_player").time;';
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript["mediatime_set"] = (block) => {
  const argument0 =
    JavaScript.valueToCode(block, "VALUE", JavaScript.ORDER_ASSIGNMENT) || "0";
  const code = `useModule("media_player").seekTo(${argument0});`;
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};
