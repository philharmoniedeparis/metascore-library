import JavaScript from "blockly/javascript";

JavaScript["media_timecode"] = function (block) {
  // Timecode value.
  const code = Number(block.getFieldValue("TIMECODE"));
  const order =
    code >= 0 ? JavaScript.ORDER_ATOMIC : JavaScript.ORDER_UNARY_NEGATION;
  return [code, order];
};

JavaScript["media_duration"] = function () {
  const code = "Media.getDuration()";
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

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

JavaScript["media_playing"] = function () {
  const code = "Media.isPlaying()";
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript["media_play"] = function () {
  const code = "Media.play();";
  return code;
};

JavaScript["media_play_excerpt"] = function (block) {
  const from = JavaScript.valueToCode(
    block,
    "FROM",
    JavaScript.ORDER_ASSIGNMENT
  );
  const to = JavaScript.valueToCode(block, "TO", JavaScript.ORDER_ASSIGNMENT);

  if (block.getInput("THEN")) {
    const statement = JavaScript.statementToCode(block, "THEN");

    let code = "";
    code += `Media.play(${from}, ${to}, function () {\n`;
    code += statement;
    code += "});\n";

    return code;
  }

  return `Media.play(${from}, ${to});`;
};

JavaScript["media_pause"] = function () {
  const code = "Media.pause();";
  return code;
};

JavaScript["media_stop"] = function () {
  const code = "Media.stop();";
  return code;
};
