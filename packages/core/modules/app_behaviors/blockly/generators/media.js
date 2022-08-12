import JavaScript from "blockly/javascript";

JavaScript["media_get_time"] = function () {
  const code = "Media.getTime()";
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript["media_set_time"] = function (block) {
  const value =
    JavaScript.valueToCode(block, "VALUE", JavaScript.ORDER_ASSIGNMENT) || "0";
  const code = `Media.setTime(${value});`;
  return code;
};

JavaScript["media_play"] = function () {
  const code = `Media.play();`;
  return code;
};

JavaScript["media_pause"] = function () {
  const code = `Media.pause();`;
  return code;
};

JavaScript["media_stop"] = function () {
  const code = `Media.stop();`;
  return code;
};
