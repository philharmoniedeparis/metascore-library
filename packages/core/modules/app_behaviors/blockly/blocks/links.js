import { ref, watchEffect } from "vue";
import { defineBlocksWithJsonArray, Extensions, Msg } from "blockly/core";
import { useModule } from "@metascore-library/core/services/module-manager";
import { EMPTY_OPTION } from "../constants";

const triggerOptions = ref([]);
watchEffect(() => {
  const { getComponentsByType } = useModule("app_components");
  const components = getComponentsByType("Content");
  const parser = new DOMParser();
  const ids = new Set();

  components.forEach((component) => {
    const text = component.text;

    if (text && text.includes("data-behavior-trigger")) {
      const doc = parser.parseFromString(text, "text/html");
      doc.querySelectorAll("a[data-behavior-trigger]").forEach((el) => {
        const id = el.dataset.behaviorTrigger;
        ids.add(id);
      });
    }
  });

  if (ids.size === 0) {
    triggerOptions.value = [[Msg.LINKS_EMPTY_OPTION, EMPTY_OPTION]];
  } else {
    triggerOptions.value = Array.from(ids)
      .sort()
      .map((id) => [id, id]);
  }
});

Extensions.register("behavior_triggers_options", function () {
  const block = this;
  const field = block.getField("TRIGGER");
  const options = field.getOptions();

  if (options.length === 1 && options[0][1] === EMPTY_OPTION) {
    field.setEnabled(false);
    block.setEnabled(false);
    block.setTooltip(Msg.LINKS_CLICK_EMPTY_TOOLTIP);
  } else {
    field.setEnabled(true);
    block.setEnabled(true);
    block.setTooltip(Msg.LINKS_CLICK_TOOLTIP);
  }
});

defineBlocksWithJsonArray([
  {
    type: "links_click",
    message0: "%{BKY_LINKS_CLICK}",
    args0: [
      {
        type: "field_dropdown",
        name: "TRIGGER",
        options: function () {
          return triggerOptions.value;
        },
      },
    ],
    message1: "%{BKY_LINKS_CLICK_THEN}",
    args1: [
      {
        type: "input_statement",
        name: "STATEMENT",
      },
    ],
    extensions: ["behavior_triggers_options"],
    style: "trigger_blocks",
    tooltip: "%{BKY_LINKS_CLICK_TOOLTIP}",
    helpUrl: "%{BKY_LINKS_CLICK_HELPURL}",
  },
  {
    type: "links_open_url",
    message0: "%{BKY_LINKS_OPEN_URL}",
    args0: [
      {
        type: "input_value",
        name: "URL",
        check: "String",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    helpUrl: "%{BKY_LINKS_OPEN_URL_HELPURL}",
  },
]);
