import { registry, Events } from "blockly/core";
import TimecodeValueIn from "./timecode_value_in";

Events.TIMECODE_VALUE_OUT = "timecode_value_out";

/**
 * Class for a timecode value out event.
 * @extends {TimecodeValueIn}
 */
export default class TimecodeValueOut extends TimecodeValueIn {
  /**
   * @param {!Block=} opt_block The changed block. Undefined for a blank
   *     event.
   * @param {?string=} opt_field Name of field affected, or null.
   * @param {*=} opt_value The value of element.
   */
  constructor(opt_block, opt_field, opt_value) {
    super(opt_block, opt_field);

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = Events.TIMECODE_VALUE_OUT;

    if (!opt_block) {
      return; // Blank event to be populated by fromJson.
    }

    this.value = typeof opt_value === "undefined" ? "" : opt_value;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json["value"] = this.value;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.value = json["value"];
  }
}

registry.register(
  registry.Type.EVENT,
  Events.TIMECODE_VALUE_OUT,
  TimecodeValueOut
);
