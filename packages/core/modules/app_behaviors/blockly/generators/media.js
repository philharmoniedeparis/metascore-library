import { javascriptGenerator as Generator, Order } from "blockly/javascript";
import { round } from "lodash";

Generator.forBlock["media_timecode"] = function (block) {
  // Timecode value.
  const code = round(Number(block.getFieldValue("TIMECODE")), 2);
  const order = code >= 0 ? Order.ATOMIC : Order.UNARY_NEGATION;
  return [code, order];
};

Generator.forBlock["media_duration"] = function () {
  const code = "Media.getDuration()";
  return [code, Order.FUNCTION_CALL];
};

Generator.forBlock["media_get_time"] = function () {
  const code = "Media.getTime()";
  return [code, Order.FUNCTION_CALL];
};

Generator.forBlock["media_set_time"] = function (block) {
  const value = Generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";
  const code = `Media.setTime(${value});`;
  return code;
};

Generator.forBlock["media_playing"] = function () {
  const code = "Media.isPlaying()";
  return [code, Order.FUNCTION_CALL];
};

Generator.forBlock["media_play"] = function () {
  const code = "Media.play();";
  return code;
};

Generator.forBlock["media_play_excerpt"] = function (block) {
  const from = Generator.valueToCode(block, "FROM", Order.ASSIGNMENT);
  const to = Generator.valueToCode(block, "TO", Order.ASSIGNMENT);

  if (block.getInput("THEN")) {
    const statement = Generator.statementToCode(block, "THEN");

    let code = "";
    code += `Media.play(${from}, ${to}, function () {\n`;
    code += statement;
    code += "});\n";

    return code;
  }

  return `Media.play(${from}, ${to});`;
};

Generator.forBlock["media_pause"] = function () {
  const code = "Media.pause();";
  return code;
};

Generator.forBlock["media_stop"] = function () {
  const code = "Media.stop();";
  return code;
};
