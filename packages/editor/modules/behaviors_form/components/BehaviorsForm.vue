<i18n>
{
  "fr": {
    "categories": {
      "triggers": "Déclencheurs",
      "logic": "Logique",
      "math": "Mathématiques",
      "text": "Texte",
      "color": "Couleur",
      "actions": "Actions",
      "media": "Media",
      "components": "Attributs de composants",
      "variables": "Variables",
      "presets": "Prédéfinis",
    }
  },
  "en": {
    "categories": {
      "triggers": "Triggers",
      "logic": "Logic",
      "math": "Math",
      "text": "Text",
      "color": "Color",
      "actions": "Actions",
      "media": "Média",
      "components": "Component attributes",
      "variables": "Variables",
      "presets": "Presets",
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
import { merge } from "lodash";
import { markRaw } from "vue";
import { DisableTopBlocks } from "@blockly/disable-top-blocks";
import {
  ContinuousToolbox,
  ContinuousMetrics,
} from "@blockly/continuous-toolbox";
import "@blockly/block-plus-minus";
import { useModule } from "@metascore-library/core/services/module-manager";
import Theme from "../blockly/theme";
import Flyout from "../blockly/plugins/flyout";

export default {
  props: {},
  setup() {
    const {
      Blockly,
      data: behaviors,
      setData: setBehaviors,
    } = useModule("app_behaviors");
    const { findComponent, getModel } = useModule("app_components");
    const { time: mediaTime, seekTo: seekMediaTo } = useModule("media_player");
    return {
      Blockly,
      behaviors,
      setBehaviors,
      findComponent,
      getModel,
      mediaTime,
      seekMediaTo,
    };
  },
  data() {
    return {
      workspace: null,
      loaded: false,
    };
  },
  computed: {
    config() {
      return {
        theme: Theme,
        renderer: "zelos",
        media: `${this.publicPath}blockly/media/`,
        grid: {
          spacing: 100,
          length: 100,
          colour: "rgba(255, 255, 255, 0.25)",
          snap: true,
        },
        zoom: {
          controls: true,
          wheel: false,
          pinch: true,
          startScale: 0.675,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        plugins: {
          toolbox: ContinuousToolbox,
          flyoutsVerticalToolbox: Flyout,
          metricsManager: ContinuousMetrics,
        },
        toolbox: this.toolbox,
      };
    },
    toolbox() {
      return {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: this.$t("categories.triggers"),
            categorystyle: "triggers_category",
            contents: this.triggerBlocks,
          },
          {
            kind: "category",
            name: this.$t("categories.actions"),
            categorystyle: "actions_category",
            contents: this.actionBlocks,
          },
          {
            kind: "category",
            name: this.$t("categories.logic"),
            categorystyle: "logic_category",
            contents: this.logicBlocks,
          },
          {
            kind: "category",
            name: this.$t("categories.math"),
            categorystyle: "math_category",
            contents: this.mathBlocks,
          },
          {
            kind: "category",
            name: this.$t("categories.text"),
            categorystyle: "text_category",
            contents: this.textBlocks,
          },
          {
            kind: "category",
            name: this.$t("categories.color"),
            categorystyle: "color_category",
            contents: this.colorBlocks,
          },
          {
            kind: "category",
            name: this.$t("categories.media"),
            categorystyle: "media_category",
            contents: this.mediaBlocks,
          },
          {
            kind: "category",
            name: this.$t("categories.components"),
            categorystyle: "components_category",
            contents: this.componentBlocks,
          },
          {
            kind: "category",
            categorystyle: "variables_category",
            custom: "VARIABLE",
          },
          {
            kind: "category",
            name: this.$t("categories.presets"),
            categorystyle: "presets_category",
            contents: this.presetBlocks,
          },
        ],
      };
    },
    triggerBlocks() {
      return [
        { kind: "block", type: "app_startup" },
        { kind: "block", type: "keyboard_keypressed" },
        { kind: "block", type: "components_click" },
        { kind: "block", type: "links_click" },
        { kind: "block", type: "reactivity_when" },
      ];
    },
    actionBlocks() {
      // Hide
      let hideable_component = this.findComponent((c) => {
        const model = this.getModel(c.type);
        return model.$isHideable;
      });
      let hide_block = {
        kind: "block",
        type: "components_set_property",
        fields: { PROPERTY: "hidden" },
        inputs: {
          VALUE: {
            block: { type: "logic_boolean", fields: { BOOL: "TRUE" } },
          },
        },
        extraState: { property: "hidden" },
      };
      merge(
        hide_block,
        hideable_component
          ? {
              fields: {
                COMPONENT: `${hideable_component.type}:${hideable_component.id}`,
              },
            }
          : { type: "components_set_property_mock" }
      );

      // Show
      const show_block = merge({}, hide_block, {
        inputs: {
          VALUE: {
            block: { fields: { BOOL: "FALSE" } },
          },
        },
      });

      // Background color
      let backgroundable_component = this.findComponent((c) => {
        const model = this.getModel(c.type);
        return model.$isBackgroundable;
      });
      let background_color_block = {
        kind: "block",
        type: "components_set_property",
        fields: { PROPERTY: "background-color" },
        inputs: {
          VALUE: {
            block: { type: "colour_picker" },
          },
        },
        extraState: { property: "background-color" },
      };
      merge(
        background_color_block,
        backgroundable_component
          ? {
              fields: {
                COMPONENT: `${backgroundable_component.type}:${backgroundable_component.id}`,
              },
            }
          : { type: "components_set_property_mock" }
      );

      return [
        { kind: "block", type: "media_play" },
        {
          kind: "block",
          type: "media_play_excerpt",
          inputs: {
            FROM: { block: { type: "media_timecode" } },
            TO: { block: { type: "media_timecode" } },
          },
        },
        { kind: "block", type: "media_pause" },
        { kind: "block", type: "media_stop" },
        { kind: "block", type: "media_set_time" },
        { kind: "block", type: "components_set_scenario" },
        hide_block,
        show_block,
        background_color_block,
        { kind: "block", type: "components_set_property" },
        { kind: "block", type: "components_set_block_page" },
        {
          kind: "block",
          type: "links_open_url",
          inputs: {
            URL: { block: { type: "text" } },
          },
        },
      ];
    },
    logicBlocks() {
      return [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "controls_if", extraState: { hasElse: true } },
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_negate" },
        { kind: "block", type: "logic_boolean" },
      ];
    },
    mathBlocks() {
      return [
        { kind: "block", type: "math_number" },
        { kind: "block", type: "math_arithmetic" },
      ];
    },
    textBlocks() {
      return [{ kind: "block", type: "text" }];
    },
    colorBlocks() {
      return [{ kind: "block", type: "colour_picker" }];
    },
    mediaBlocks() {
      return [
        { kind: "block", type: "media_timecode" },
        { kind: "block", type: "media_get_time" },
        { kind: "block", type: "media_get_duration" },
        { kind: "block", type: "media_playing" },
      ];
    },
    componentBlocks() {
      // Hidden
      let hideable_component = this.findComponent((c) => {
        const model = this.getModel(c.type);
        return model.$isHideable;
      });
      let hidden_block = {
        kind: "block",
        type: "components_get_property",
        fields: { PROPERTY: "hidden" },
        extraState: { property: "hidden" },
      };
      merge(
        hidden_block,
        hideable_component
          ? {
              fields: {
                COMPONENT: `${hideable_component.type}:${hideable_component.id}`,
              },
            }
          : { type: "components_get_property_mock" }
      );

      // Background color
      let backgroundable_component = this.findComponent((c) => {
        const model = this.getModel(c.type);
        return model.$isBackgroundable;
      });
      let background_color_block = {
        kind: "block",
        type: "components_get_property",
        fields: { PROPERTY: "background-color" },
        extraState: { property: "background-color" },
      };
      merge(
        background_color_block,
        backgroundable_component
          ? {
              fields: {
                COMPONENT: `${backgroundable_component.type}:${backgroundable_component.id}`,
              },
            }
          : { type: "components_get_property_mock" }
      );

      return [
        hidden_block,
        background_color_block,
        { kind: "block", type: "components_get_property" },
        { kind: "block", type: "components_get_block_page" },
      ];
    },
    presetBlocks() {
      return [
        {
          kind: "block",
          type: "components_click",
          inputs: {
            STATEMENT: {
              block: {
                next: {
                  block: {
                    type: "media_play_excerpt",
                    inputs: {
                      TO: {
                        block: { type: "media_timecode" },
                      },
                      FROM: {
                        block: { type: "media_timecode" },
                      },
                      THEN: {
                        block: { type: "components_set_scenario" },
                      },
                    },
                    extraState: { hasThen: true },
                  },
                },
                type: "components_set_scenario",
              },
            },
          },
        },
      ];
    },
  },
  async mounted() {
    this.workspace = markRaw(
      this.Blockly.inject(this.$refs.blockly, this.config)
    );

    this.deserialize(this.behaviors);

    // Listen to changes to update behaviors.
    this.workspace.addChangeListener(this.onWorkspaceChange);

    // Setup the DisableTopBlocks plugin.
    this.workspace.addChangeListener(this.Blockly.Events.disableOrphans);
    new DisableTopBlocks().init();

    this._resize_observer = new ResizeObserver(this.updateSize);
    this._resize_observer.observe(this.$el);
    this.updateSize();
  },
  beforeUnmount() {
    this.workspace.dispose();
    this.workspace = null;

    if (this._resize_observer) {
      this._resize_observer.disconnect();
      delete this._resize_observer;
    }
  },
  methods: {
    serialize() {
      return this.Blockly.serialization.workspaces.save(this.workspace);
    },
    deserialize(state) {
      this.Blockly.serialization.workspaces.load(state || {}, this.workspace);
    },
    onWorkspaceChange(evt) {
      if (!this.loaded) {
        if (evt.type === "finished_loading") {
          this.loaded = true;
        }
        return;
      }

      switch (evt.type) {
        case "timecode_value_in":
          {
            const block = this.workspace.getBlockById(evt.blockId);
            if (!block) {
              console.warn(
                "Can't get field from non-existent block: " + evt.blockId
              );
              return;
            }
            const field = block.getField(evt.field);
            if (!field) {
              console.warn(
                "Can't set value on non-existent field: " + evt.field
              );
              return;
            }
            field.setValue(this.mediaTime);
          }
          break;
        case "timecode_value_out":
          {
            const value = evt.value;
            this.seekMediaTo(value);
          }
          break;
      }

      if (!evt.isUiEvent && evt.workspaceId === this.workspace.id) {
        // Save the changes.
        this.setBehaviors(this.serialize());
      }
    },
    updateSize() {
      this.Blockly.svgResize(this.workspace);
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

  :deep(.blocklyToolboxDiv) {
    max-width: 0;
  }

  :deep(.blocklyFlyoutLabelText) {
    font-size: 24px;
  }

  :deep(.blocklyMainBackground) {
    stroke: none;
  }
}
</style>
