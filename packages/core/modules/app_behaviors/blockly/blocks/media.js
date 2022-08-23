import {
  defineBlocksWithJsonArray,
  Extensions,
  Mutator,
  Msg,
} from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "media_get_duration",
    message0: "%{BKY_MEDIA_GET_DURATION}",
    output: "Number",
    style: "variable_blocks",
    tooltip: "%{BKY_MEDIA_GET_DURATION_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_GET_DURATION_HELPURL}",
  },
  {
    type: "media_get_time",
    message0: "%{BKY_MEDIA_GET_TIME}",
    output: "Number",
    style: "variable_blocks",
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
    style: "variable_blocks",
    tooltip: "%{BKY_MEDIA_SET_TIME_TOOLTIP}",
    helpUrl: "%{BKY_MEDIA_SET_TIME_HELPURL}",
  },
  {
    type: "media_playing",
    message0: "%{BKY_MEDIA_PLAYING}",
    output: "Boolean",
    style: "variable_blocks",
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

/**
 * Mutator methods added to media_play_excerpt block.
 * @mixin
 * @augments Block
 * @readonly
 */
const MEDIA_PLAY_EXCERPT_MUTATOR_MIXIN = {
  hasThen_: false,

  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {?{elseIfCount: (number|undefined), haseElse: (boolean|undefined)}}
   *     The state of this block.
   */
  saveExtraState: function () {
    return {
      hasThen: this.hasThen_,
    };
  },

  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block.
   */
  loadExtraState: function (state) {
    this.hasThen_ = state["hasThen"] ? true : false;
    this.updateShape_();
  },

  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Workspace} workspace Mutator's workspace.
   * @return {!Block} Root block in mutator.
   * @this {Block}
   */
  decompose: function (workspace) {
    const topBlock = workspace.newBlock("media_play_excerpt_top");
    topBlock.initSvg();

    if (this.hasThen_) {
      const thenBlock = workspace.newBlock("media_play_excerpt_then");
      thenBlock.initSvg();
      topBlock.nextConnection.connect(thenBlock.previousConnection);
    }

    return topBlock;
  },

  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Block} topBlock Root block in mutator.
   * @this {Block}
   */
  compose: function (topBlock) {
    let nextBlock = topBlock.nextConnection.targetBlock();

    this.hasThen_ = false;

    let thenStatementConnection = null;

    while (nextBlock && !nextBlock.isInsertionMarker()) {
      switch (nextBlock.type) {
        case "media_play_excerpt_then":
          this.hasThen_ = true;
          thenStatementConnection = nextBlock.statementConnection_;
          break;
        default:
          throw TypeError("Unknown block type: " + nextBlock.type);
      }
      nextBlock =
        nextBlock.nextConnection && nextBlock.nextConnection.targetBlock();
    }
    this.updateShape_();

    // Reconnect child blocks.
    Mutator.reconnect(thenStatementConnection, this, "THEN");
  },

  /**
   * Store pointers to any connected child blocks.
   * @param {!Block} topBlock Root block in mutator.
   * @this {Block}
   */
  saveConnections: function (topBlock) {
    let nextBlock = topBlock.nextConnection.targetBlock();
    while (nextBlock) {
      switch (nextBlock.type) {
        case "media_play_excerpt_then": {
          const thenInput = this.getInput("THEN");
          nextBlock.statementConnection_ =
            thenInput && thenInput.connection.targetConnection;
          break;
        }
        default:
          throw TypeError("Unknown block type: " + nextBlock.type);
      }
      nextBlock =
        nextBlock.nextConnection && nextBlock.nextConnection.targetBlock();
    }
  },

  /**
   * Modify this block to have the correct number of inputs.
   * @this {Block}
   * @private
   */
  updateShape_: function () {
    // Add the then statement.
    if (this.hasThen_) {
      if (!this.getInput("THEN")) {
        this.appendStatementInput("THEN").appendField(
          Msg["MEDIA_PLAY_EXCERPT_THEN"]
        );
      }
    } else if (this.getInput("THEN")) {
      this.removeInput("THEN");
    }
  },
};

Extensions.registerMutator(
  "media_play_excerpt_mutator",
  MEDIA_PLAY_EXCERPT_MUTATOR_MIXIN,
  null,
  ["media_play_excerpt_then"]
);
