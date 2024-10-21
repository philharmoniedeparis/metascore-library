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
      "app": "Application",
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
      "app": "Application",
      "media": "Média",
      "components": "Component attributes",
      "variables": "Variables",
      "presets": "Presets",
    }
  },
}
</i18n>

<template>
  <div class="behaviors-form" @contextmenu="onContextmenu">
    <div ref="blockly" class="blockly"></div>
  </div>
</template>

<script>
import { unref, markRaw } from "vue";
import { DisableTopBlocks } from "@blockly/disable-top-blocks";
import "@blockly/block-plus-minus";
import useStore from "../store";
import getConfig from "../blockly";
import { useModule } from "@core/services/module-manager";

export default {
  props: {},
  setup() {
    const store = useStore();
    const {
      Blockly,
      data: behaviors,
      setData: setBehaviors,
    } = useModule("app_behaviors");
    const { findComponent, getModelByType } = useModule("app_components");
    const { time: mediaTime, seekTo: seekMediaTo } = useModule("media_player");
    return {
      store,
      Blockly,
      behaviors,
      setBehaviors,
      findComponent,
      getModelByType,
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
    viewport: {
      get() {
        return this.store.viewport;
      },
      set(value) {
        this.store.viewport = value;
      },
    },
  },
  mounted() {
    const config = getConfig({
      $t: this.$t,
      publicPath: unref(this.publicPath),
    });

    this.workspace = markRaw(this.Blockly.inject(this.$refs.blockly, config));

    this.deserialize(this.behaviors);

    // Listen to changes to update behaviors.
    this.workspace.addChangeListener(this.onWorkspaceChange);

    // Setup the DisableTopBlocks plugin.
    this.workspace.addChangeListener(this.Blockly.Events.disableOrphans);
    new DisableTopBlocks().init();

    if (this.viewport) {
      // Restore viewport.
      this.workspace.setScale(this.viewport.scale);
      this.workspace.scroll(this.viewport.left, this.viewport.top);
    }

    this._resize_observer = new ResizeObserver(this.updateSize);
    this._resize_observer.observe(this.$el);
    this.updateSize();

    this.$el.ownerDocument.addEventListener(
      "mousedown",
      this.onDocumentMousedown
    );
  },
  beforeUnmount() {
    this.workspace.dispose();
    this.workspace = null;

    if (this._resize_observer) {
      this._resize_observer.disconnect();
      delete this._resize_observer;
    }

    this.$el.ownerDocument.removeEventListener(
      "mousedown",
      this.onDocumentMousedown
    );
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

        case "viewport_change":
          this.viewport = {
            scale: evt.scale,
            left: evt.viewLeft * -1,
            top: evt.viewTop * -1,
          };
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
    onDocumentMousedown(evt) {
      // If clicked outside.
      if (
        !evt.target.closest(
          ".behaviors-form, [class^='blockly'], [class*=' blockly']"
        )
      ) {
        // Close tooltips, context menus and dropdowns.
        this.workspace.hideChaff();
        // Prevent handleding of keyboard shortcuts by the workspace.
        this.Blockly.common.setMainWorkspace(null);
      }
    },
    onContextmenu(evt) {
      if (evt.target.closest("rect.blocklyMainBackground")) {
        // Prevent showing the metaScore context menu.
        evt.stopPropagation();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.behaviors-form {
  position: relative;
  height: 100%;
  background: var(--metascore-color-bg-primary);
  color: var(--metascore-color-white);
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
