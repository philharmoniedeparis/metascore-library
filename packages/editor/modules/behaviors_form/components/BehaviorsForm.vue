<i18n>
{
  "fr": {
    "categories": {
      "triggers": "Déclencheurs",
      "logic": "Logique",
      "math": "Mathématiques",
      "actions": "Actions",
      "variables": {
        "root": "Variables",
        "builtin": "Built-in",
        "custom": "Custom",
      },
    }
  },
  "en": {
    "categories": {
      "triggers": "Triggers",
      "logic": "Logic",
      "math": "Math",
      "actions": "Actions",
      "variables": {
        "root": "Variables",
        "builtin": "Built-in",
        "custom": "Custom",
      },
    }
  },
}
</i18n>

<template>
  <div class="behaviors-form">
    <div ref="blockly" class="blockly"></div>
  </div>
</template>

<script>
import * as Blockly from "blockly/core";
import Theme from "../blockly/theme";
import "blockly/blocks";
import "../blockly/blocks";
import useStore from "../store";

export default {
  props: {},
  setup() {
    const store = useStore();
    return {
      store,
    };
  },
  data() {
    return {
      workspace: null,
    };
  },
  computed: {},
  async mounted() {
    // Import the locale.
    const locale = this.$i18n.locale;
    const { default: blocklyLocale } = await import(
      /* webpackMode: "lazy" */
      /* webpackChunkName: "blockly-locale-[request]" */
      `../blockly/msg/${locale}`
    );

    Blockly.setLocale(blocklyLocale);

    this.workspace = Blockly.inject(this.$refs.blockly, {
      theme: Theme,
      toolbox: {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: this.$t("categories.triggers"),
            categorystyle: "triggers",
            contents: [],
          },
          {
            kind: "category",
            name: this.$t("categories.logic"),
            categorystyle: "logic",
            contents: [
              { kind: "block", type: "controls_if" },
              { kind: "block", type: "logic_compare" },
              { kind: "block", type: "logic_operation" },
              { kind: "block", type: "logic_negate" },
              { kind: "block", type: "logic_boolean" },
            ],
          },
          {
            kind: "category",
            name: this.$t("categories.math"),
            categorystyle: "math",
            contents: [
              { kind: "block", type: "math_number" },
              { kind: "block", type: "math_arithmetic" },
            ],
          },
          {
            kind: "category",
            name: this.$t("categories.actions"),
            categorystyle: "actions",
            contents: [],
          },
          {
            kind: "category",
            name: this.$t("categories.variables.root"),
            categorystyle: "variables",
            expanded: "true",
            contents: [
              {
                kind: "category",
                name: this.$t("categories.variables.builtin"),
                contents: [
                  { kind: "block", type: "mediatime_get" },
                  { kind: "block", type: "mediatime_set" },
                ],
              },
              {
                kind: "category",
                name: this.$t("categories.variables.custom"),
                custom: "VARIABLE",
              },
            ],
          },
        ],
      },
    });

    this._resize_observer = new ResizeObserver(this.updateSize);
    this._resize_observer.observe(this.$el);
    this.updateSize();
  },
  beforeUnmount() {
    if (this._resize_observer) {
      this._resize_observer.disconnect();
      delete this._resize_observer;
    }
  },
  methods: {
    serialize() {
      return Blockly.serialization.workspaces.save(this.workspace);
    },
    updateSize() {
      Blockly.svgResize(this.workspace);
    },
  },
};
</script>

<style lang="scss" scoped>
.behaviors-form {
  position: relative;
  height: 100%;
  background: $lightgray;
  color: $white;
}

.blockly {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
