<template>
  <div class="behaviors-form">
    <div ref="blockly" class="blockly"></div>
  </div>
</template>

<script>
import * as Blockly from "blockly/core";
import Theme from "../blockly/theme";
import "blockly/blocks";
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
      /* webpackInclude: /(en|fr)\.js/ */
      /* webpackMode: "lazy" */
      /* webpackChunkName: "blockly-locale-[request]" */
      `blockly/msg/${locale}`
    );

    Blockly.setLocale(blocklyLocale);

    this.workspace = Blockly.inject(this.$refs.blockly, {
      theme: Theme,
      toolbox: {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "Triggers",
            categorystyle: "triggers",
            contents: [],
          },
          {
            kind: "category",
            name: "Logic",
            categorystyle: "logic",
            contents: [
              {
                kind: "block",
                type: "controls_if",
              },
              {
                kind: "block",
                type: "logic_compare",
              },
              {
                kind: "block",
                type: "logic_operation",
              },
              {
                kind: "block",
                type: "logic_boolean",
              },
            ],
          },
        ],
      },
    });

    this.workspace.addChangeListener(this.onWorkspaceChange);

    this._resize_observer = new ResizeObserver(this.updateSize);
    this._resize_observer.observe(this.$el);
    this.updateSize();
  },
  beforeUnmount() {
    this.workspace.removeChangeListener(this.onWorkspaceChange);

    if (this._resize_observer) {
      this._resize_observer.disconnect();
      delete this._resize_observer;
    }
  },
  methods: {
    onWorkspaceChange() {
      console.log(Blockly.serialization.workspaces.save(this.workspace));
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
