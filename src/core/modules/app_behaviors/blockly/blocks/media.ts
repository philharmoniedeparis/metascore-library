import {
  defineBlocksWithJsonArray,
  Extensions,
  Msg,
  FieldCheckbox,
  FieldLabel,
  Block,
} from "blockly/core";
import { createMinusField } from "@blockly/block-plus-minus/src/field_minus";
import { createPlusField } from "@blockly/block-plus-minus/src/field_plus";

defineBlocksWithJsonArray([
  // Block for timecode value
  {
    type: "media_timecode",
    message0: "%1",
    args0: [
      {
        type: "field_timecode",
        name: "TIMECODE",
      },
    ],
    output: "Number",
    style: "media_blocks",
    helpUrl: "%{BKY_MEDIA_TIMECODE_HELPURL}",
    tooltip: "%{BKY_MEDIA_TIMECODE_TOOLTIP}",
    extensions: ["parent_tooltip_when_inline"],
  },
  {
    type: "media_get_duration",
    message0: "%{BKY_MEDIA_GET_DURATION}",
    output: "Number",
    style: "media_blocks",
    tooltip: "%{BKY_MEDIA_GET_DURATION_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_GET_DURATION_HELPURL}",
  },
  {
    type: "media_get_time",
    message0: "%{BKY_MEDIA_GET_TIME}",
    output: "Number",
    style: "media_blocks",
    tooltip: "%{BKY_MEDIA_GET_TIME_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_GET_TIME_HELPURL}",
  },
  {
    type: "media_set_time",
    message0: "%{BKY_MEDIA_SET_TIME}",
    args0: [
      {
        type: "input_value",
        name: "VALUE",
        check: "Number",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_MEDIA_SET_TIME_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_SET_TIME_HELPURL}",
  },
  {
    type: "media_playing",
    message0: "%{BKY_MEDIA_PLAYING}",
    output: "Boolean",
    style: "media_blocks",
    tooltip: "%{BKY_MEDIA_PLAYING_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_PLAYING_HELPURL}",
  },
  {
    type: "media_play",
    message0: "%{BKY_MEDIA_PLAY}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_MEDIA_PLAY_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_PLAY_HELPURL}",
  },
  {
    type: "media_play_excerpt",
    message0: "%{BKY_MEDIA_PLAY_EXCERPT}",
    args0: [
      {
        type: "input_dummy",
        name: "PLUS_MINUS",
      },
      {
        type: "input_value",
        name: "FROM",
        check: "Number",
      },
      {
        type: "input_value",
        name: "TO",
        check: "Number",
      },
      {
        type: "input_dummy",
        name: "LINK_HIGHLIGHT",
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    mutator: "media_play_excerpt_mutator",
    tooltip: "%{BKY_MEDIA_PLAY_EXCERPT_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_PLAY_EXCERPT_HELPURL}",
  },
  // Block representing the top block in the media_play_excerpt mutator.
  {
    type: "media_play_excerpt_top",
    message0: "%{BKY_MEDIA_PLAY_EXCERPT}",
    args0: [
      {
        type: "input_value",
        name: "FROM",
        check: "Number",
      },
      {
        type: "input_value",
        name: "TO",
        check: "Number",
      },
    ],
    inputsInline: true,
    nextStatement: null,
    enableContextMenu: false,
    style: "actions_blocks",
    tooltip: "%{BKY_MEDIA_PLAY_EXCERPT_TOP_TOOLTIP}",
  },
  // Block representing the then statement in the media_play_excerpt mutator.
  {
    type: "media_play_excerpt_then",
    message0: "%{BKY_MEDIA_PLAY_EXCERPT_THEN}",
    previousStatement: null,
    enableContextMenu: false,
    style: "actions_blocks",
    tooltip: "%{BKY_MEDIA_PLAY_EXCERPT_THEN_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_PLAY_EXCERPT_THEN_HELPURL}",
  },
  {
    type: "media_pause",
    message0: "%{BKY_MEDIA_PAUSE}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_MEDIA_PAUSE_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_PAUSE_HELPURL}",
  },
  {
    type: "media_stop",
    message0: "%{BKY_MEDIA_STOP}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_MEDIA_STOP_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_STOP_HELPURL}",
  },
]);

type MediaPlayExcerptMixinType = typeof MEDIA_PLAY_EXCERPT_MUTATOR_MIXIN;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MediaPlayExcerptMixin extends MediaPlayExcerptMixinType {}
type MediaPlayExcerptBlock = Block & MediaPlayExcerptMixin;
type MediaPlayExcerptState = {
  hasLinkHighlight: boolean
  hasThen: boolean
};

/**
 * Mutator methods added to media_play_excerpt block.
 */
const MEDIA_PLAY_EXCERPT_MUTATOR_MIXIN = {
  hasLinkHighlight_: false,
  hasThen_: false,

  /**
   * Returns the state of this block as a JSON serializable object.
   */
  saveExtraState: function (this: MediaPlayExcerptBlock) {
    if (!this.hasLinkHighlight_ && !this.hasThen_) {
      return null;
    }

    const data = {} as { hasLinkHighlight: boolean, hasThen: boolean };
    if (this.hasLinkHighlight_) {
      data.hasLinkHighlight = true;
    }
    if (this.hasThen_) {
      data.hasThen = true;
    }
    return data;
  },

  /**
   * Applies the given state to this block.
   */
  loadExtraState: function (this: MediaPlayExcerptBlock, state: MediaPlayExcerptState) {
    this.hasLinkHighlight_ = state["hasLinkHighlight"] || false;
    this.hasThen_ = state["hasThen"] || false;
    this.updateShape_();
  },

  /**
   * Callback for the plus field.
   */
  plus: function (this: MediaPlayExcerptBlock) {
    this.hasThen_ = true;
    this.updateShape_();
  },

  /**
   * Callback for the minus field.
   */
  minus: function (this: MediaPlayExcerptBlock) {
    this.hasThen_ = false;
    this.updateShape_();
  },

  /**
   * Modify this block to have the correct number of inputs.
   */
  updateShape_: function (this: MediaPlayExcerptBlock) {
    const input = this.getInput("LINK_HIGHLIGHT");

    if (this.hasLinkHighlight_) {
      if (!this.getField("HIGHLIGHT_LINK")) {
        const checkbox = new FieldCheckbox();
        checkbox.setTooltip(Msg["MEDIA_PLAY_EXCERPT_HIGHLIGHT_LINK_TOOLTIP"]);

        const label = new FieldLabel(Msg["MEDIA_PLAY_EXCERPT_HIGHLIGHT_LINK"]);
        label.setTooltip(Msg["MEDIA_PLAY_EXCERPT_HIGHLIGHT_LINK_TOOLTIP"]);

        input
          ?.appendField(checkbox, "HIGHLIGHT_LINK")
          .appendField(label, "HIGHLIGHT_LINK_LABEL");
      }
    } else {
      input?.fieldRow
        .map((field) => field.name)
        .forEach((name) => {
          input.removeField(name!);
        });
    }

    if (this.hasThen_) {
      // Update plus/minus buttons.
      if (this.getField("PLUS")) {
        this.getInput("PLUS_MINUS")?.removeField("PLUS");
      }
      if (!this.getField("MINUS")) {
        this.getInput("PLUS_MINUS")?.appendField(createMinusField(), "MINUS");
      }
      // Add "then" input.
      if (!this.getInput("THEN")) {
        this.appendStatementInput("THEN").appendField(
          Msg["MEDIA_PLAY_EXCERPT_THEN"]
        );
      }
    } else {
      // Update plus/minus buttons.
      if (!this.getField("PLUS")) {
        this.getInput("PLUS_MINUS")?.appendField(createPlusField(), "PLUS");
      }
      if (this.getField("MINUS")) {
        this.getInput("PLUS_MINUS")?.removeField("MINUS");
      }
      // Remove "then" input.
      if (this.getInput("THEN")) {
        this.removeInput("THEN");
      }
    }
  },
};

/**
 * Adds the initial plus button.
 */
const MEDIA_PLAY_EXCERPT_MUTATOR_HELPER = function (this: MediaPlayExcerptBlock) {
  this.setOnChange(function (this: MediaPlayExcerptBlock, evt) {
    if (evt.isUiEvent) return;

    const parent_block = this.getSurroundParent();
    const hasLinkHighlight =
      parent_block && parent_block.type === "links_click";

    if (this.hasLinkHighlight_ !== hasLinkHighlight) {
      this.hasLinkHighlight_ = !!hasLinkHighlight;
      this.updateShape_();
    }
  });

  this.updateShape_();
};

Extensions.registerMutator(
  "media_play_excerpt_mutator",
  MEDIA_PLAY_EXCERPT_MUTATOR_MIXIN,
  MEDIA_PLAY_EXCERPT_MUTATOR_HELPER,
  ["media_play_excerpt_then"]
);
