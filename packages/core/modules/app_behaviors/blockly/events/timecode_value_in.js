import { registry, Events } from "blockly/core";

Events.TIMECODE_VALUE_IN = "timecode_value_in";

/**
 * Class for a timecode value in event.
 * @extends {Events.UiBase}
 */
export default class TimecodeValueIn extends Events.UiBase {
  /**
   * @param {!Block=} opt_block The changed block. Undefined for a blank
   *     event.
   * @param {?string=} opt_field Name of field affected, or null.
   */
  constructor(opt_block, opt_field) {
    const workspaceId = opt_block ? opt_block.workspace.id : undefined;
    super(workspaceId);

    this.blockId = opt_block ? opt_block.id : null;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = Events.TIMECODE_VALUE_IN;

    if (!opt_block) {
      return; // Blank event to be populated by fromJson.
    }

    this.field = typeof opt_field === "undefined" ? "" : opt_field;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    if (this.field) {
      json["field"] = this.field;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.field = json["field"];
  }
}

registry.register(
  registry.Type.EVENT,
  Events.TIMECODE_VALUE_IN,
  TimecodeValueIn
);
