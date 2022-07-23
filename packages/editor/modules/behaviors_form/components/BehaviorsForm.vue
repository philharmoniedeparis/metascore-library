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
        "builtin": "Intégrées",
        "custom": "Personnalisées",
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
import { useModule } from "@metascore-library/core/services/module-manager";
import Blockly from "blockly/core";
import Theme from "../blockly/theme";
import "blockly/blocks";
import "../blockly/blocks";

export default {
  props: {},
  setup() {
    const { behaviors, setBehaviors } = useModule("app_behaviors");
    return { behaviors, setBehaviors };
  },
  data() {
    return {
      workspace: null,
      loaded: false,
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
      renderer: "zelos",
      grid: {
        spacing: 20,
        length: 20,
        colour: "rgba(255, 255, 255, 0.1)",
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: false,
        pinch: true,
        startScale: 0.95,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      toolbox: {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: this.$t("categories.triggers"),
            categorystyle: "triggers_category",
            contents: [
              { kind: "block", type: "keyboard_keypressed" },
              { kind: "block", type: "components_click" },
              { kind: "block", type: "links_click" },
              { kind: "block", type: "reactivity_watch" },
            ],
          },
          {
            kind: "category",
            name: this.$t("categories.logic"),
            categorystyle: "logic_category",
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
            categorystyle: "math_category",
            contents: [
              { kind: "block", type: "math_number" },
              { kind: "block", type: "math_arithmetic" },
            ],
          },
          {
            kind: "category",
            name: this.$t("categories.actions"),
            categorystyle: "actions_category",
            contents: [],
          },
          {
            kind: "category",
            name: this.$t("categories.variables.root"),
            categorystyle: "variables_category",
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

    this.deserialize(this.behaviors);

    this.workspace.addChangeListener(this.onWorkspaceChange);

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
    deserialize(state) {
      Blockly.serialization.workspaces.load(state || {}, this.workspace);
    },
    onWorkspaceChange(evt) {
      if (evt.isUiEvent) {
        return;
      }

      if (!this.loaded) {
        if (evt.type === "finished_loading") {
          this.loaded = true;
        }
        return;
      }

      const behaviors = this.serialize();
      this.setBehaviors(behaviors);
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
