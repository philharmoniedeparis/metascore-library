<i18n>
{
  "fr": {
    "hotkey": {
      "group": "Espace de travail",
      "right": "Déplacer le(s) composant(s) sélectionné(s) de 1 pixel vers la droite",
      "shift+right": "Déplacer le(s) composant(s) sélectionné(s) de 10 pixel vers la droite",
      "left": "Déplacer le(s) composant(s) sélectionné(s) de 1 pixel vers la gauche",
      "shift+left": "Déplacer le(s) composant(s) sélectionné(s) de 10 pixel vers la gauche",
      "up": "Déplacer le(s) composant(s) sélectionné(s) de 1 pixel vers le haut",
      "shift+up": "Déplacer le(s) composant(s) sélectionné(s) de 10 pixel vers le haut",
      "down": "Déplacer le(s) composant(s) sélectionné(s) de 1 pixel vers le bas",
      "shift+down": "Déplacer le(s) composant(s) sélectionné(s) de 10 pixel vers le bas",
      "tab": "Sélectionner le composant suivant",
      "shift+tab": "Sélectionner le composant précédent",
      "mod+c": "Copier le(s) composant(s) sélectionné(s)",
      "mod+v": "Coller le(s) composant(s)",
      "mod+x": "Couper le(s) composant(s) sélectionné(s)",
      "mod+d": "Dupliquer le(s) composant(s) sélectionné(s)",
      "mod+l": "Verrouiller/déverrouiller le(s) composant(s) sélectionné(s)",
      "delete": "Supprimer le(s) composant(s) sélectionné(s)",
      "backspace": "Supprimer le(s) composant(s) sélectionné(s)"
    }
  },
  "en": {
    "hotkey": {
      "group": "Workspace",
      "right": "Move selected component(s) by 1 pixel to the right",
      "shift+right": "Move selected component(s) by 10 pixel to the right",
      "left": "Move selected component(s) by 1 pixel to the left",
      "shift+left": "Move selected component(s) by 10 pixels to the left",
      "up": "Move selected component(s) by 1 pixels upwards",
      "shift+up": "Move selected component(s) by 10 pixels upwards",
      "down": "Move selected component(s) by 1 pixel downwards",
      "shift+down": "Move selected component(s) by 10 pixels downwards",
      "tab": "Select the next component",
      "shift+tab": "Select the previous component",
      "mod+c": "Copy selected component(s)",
      "mod+v": "Paste component(s)",
      "mod+x": "Cut selected component(s)",
      "mod+d": "Duplicate selected component(s)",
      "mod+l": "Lock/unlock selected component(s)",
      "delete": "Delete selected component(s)",
      "backspace": "Delete selected component(s)"
    }
  }
}
</i18n>

<template>
  <div class="app-preview">
    <preview-ruler
      v-show="!preview"
      :track-target="appRendererWrapperEl"
      :major-tick-length="rulerThikness"
    />
    <preview-ruler
      v-show="!preview"
      axis="y"
      :track-target="appRendererWrapperEl"
      :major-tick-length="rulerThikness"
    />
    <div v-show="!preview" class="rulers-corner" />

    <div
      ref="app-renderer-wrapper"
      class="app-renderer-wrapper"
      :style="appRendererWrapperStyle"
      @transitionend="onAppRendererTransitionend"
    >
      <app-renderer
        ref="app-renderer"
        v-hotkey.local.stop="hotkeys"
        @keydown="onAppRendererKeydown"
        @keyup="onAppRendererKeyup"
      />
      <preview-grid v-show="!preview" :step="gridStep" :color="gridColor" />
      <div ref="controlbox-container" class="controlbox-container"></div>
      <snap-guides v-show="!preview" />
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { debounce } from "lodash";
import { trapTabFocus } from "@core/utils/dom";
import { useModule } from "@core/services/module-manager";
import "../polyfills/GeomertyUtils";
import useStore from "../store";
import PreviewRuler from "./PreviewRuler.vue";
import PreviewGrid from "./PreviewGrid.vue";
import SnapGuides from "./SnapGuides.vue";

export default {
  components: {
    PreviewRuler,
    PreviewGrid,
    SnapGuides,
  },
  provide() {
    return {
      gridStep: computed(() => this.gridStep),
      snapToGrid: computed(() => this.snapToGrid),
      snapToSiblings: computed(() => this.snapToSiblings),
      snapRange: computed(() => this.snapRange),
      disableComponentInteractions: computed(
        () => this.disableComponentInteractions
      ),
    };
  },
  props: {
    rulerThikness: {
      type: Number,
      default: 20,
    },
    gridColor: {
      type: String,
      default: "rgba(0, 0, 0, 0.1)",
    },
    gridStep: {
      type: Number,
      default: 10,
    },
    snapToGrid: {
      type: Boolean,
      default: false,
    },
    snapToSiblings: {
      type: Boolean,
      default: true,
    },
    snapRange: {
      type: Number,
      default: 5,
    },
    disableComponentInteractions: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["load"],
  setup() {
    const store = useStore();

    const {
      el: appEl,
      width: appWidth,
      height: appHeight,
      startIdleTimeTracking,
      stopIdleTimeTracking,
    } = useModule("core:app_renderer");

    const { activeScenario, deleteComponent } = useModule("core:app_components");

    const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
      useModule("editor:history");

    return {
      store,
      appEl,
      appWidth,
      appHeight,
      startIdleTimeTracking,
      stopIdleTimeTracking,
      activeScenario,
      deleteComponent,
      startHistoryGroup,
      endHistoryGroup,
    };
  },
  computed: {
    zoom() {
      return this.store.zoom;
    },
    preview() {
      return this.store.preview;
    },
    previewPersistant() {
      return this.store.previewPersistant;
    },
    appPreviewEl: {
      get() {
        return this.store.appPreviewEl;
      },
      set(value) {
        this.store.appPreviewEl = value;
      },
    },
    appPreviewRect: {
      get() {
        return this.store.appPreviewRect;
      },
      set(value) {
        this.store.appPreviewRect = value;
      },
    },
    appRendererWrapperEl: {
      get() {
        return this.store.appRendererWrapperEl;
      },
      set(value) {
        this.store.appRendererWrapperEl = value;
      },
    },
    appRendererWrapperRect: {
      get() {
        return this.store.appRendererWrapperRect;
      },
      set(value) {
        this.store.appRendererWrapperRect = value;
      },
    },
    controlboxContainer: {
      get() {
        return this.store.controlboxContainer;
      },
      set(value) {
        this.store.controlboxContainer = value;
      },
    },
    appRendererWrapperStyle() {
      if (this.zoom !== 1) {
        const width = this.appWidth * this.zoom;
        const height = this.appHeight * this.zoom;

        return {
          width: `${this.appWidth}px`,
          height: `${this.appHeight}px`,
          transform: `scale(${this.zoom})`,
          marginRight: `${width - this.appWidth - this.rulerThikness}px`,
          marginBottom: `${height - this.appHeight - this.rulerThikness}px`,
        };
      }

      return {
        width: `${this.appWidth}px`,
        height: `${this.appHeight}px`,
        marginRight: `${-this.rulerThikness}px`,
        marginBottom: `${-this.rulerThikness}px`,
      };
    },
    hotkeys() {
      if (this.preview) return {};

      return {
        group: this.$t("hotkey.group"),
        keys: {
          right: {
            handler: async (evt) => {
              evt.preventDefault();

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                await this.store.moveComponents(selected, { left: 1 });
              }
            },
            description: this.$t("hotkey.right"),
          },
          "shift+right": {
            handler: async (evt) => {
              evt.preventDefault();

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                await this.store.moveComponents(selected, { left: 10 });
              }
            },
            description: this.$t("hotkey.shift+right"),
          },
          left: {
            handler: async (evt) => {
              evt.preventDefault();

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                await this.store.moveComponents(selected, { left: -1 });
              }
            },
            description: this.$t("hotkey.left"),
          },
          "shift+left": {
            handler: async (evt) => {
              evt.preventDefault();

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                await this.store.moveComponents(selected, { left: -10 });
              }
            },
            description: this.$t("hotkey.shift+left"),
          },
          up: {
            handler: async (evt) => {
              evt.preventDefault();

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                await this.store.moveComponents(selected, { top: -1 });
              }
            },
            description: this.$t("hotkey.up"),
          },
          "shift+up": {
            handler: async (evt) => {
              evt.preventDefault();

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                await this.store.moveComponents(selected, { top: -10 });
              }
            },
            description: this.$t("hotkey.shift+up"),
          },
          down: {
            handler: async (evt) => {
              evt.preventDefault();

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                await this.store.moveComponents(selected, { top: 1 });
              }
            },
            description: this.$t("hotkey.down"),
          },
          "shift+down": {
            handler: async (evt) => {
              evt.preventDefault();

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                await this.store.moveComponents(selected, { top: 10 });
              }
            },
            description: this.$t("hotkey.shift+down"),
          },
          tab: {
            handler: (evt) => {
              trapTabFocus(this.$refs["app-renderer"]?.$el, evt);
            },
            description: this.$t("hotkey.tab"),
          },
          "shift+tab": {
            handler: (evt) => {
              trapTabFocus(this.$refs["app-renderer"]?.$el, evt);
            },
            description: this.$t("hotkey.shift+tab"),
          },
          "mod+c": {
            handler: (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                this.store.copyComponents(selected);
              }
            },
            description: this.$t("hotkey.mod+c"),
          },
          "mod+x": {
            handler: async (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                await this.store.cutComponents(selected);
              }
            },
            description: this.$t("hotkey.mod+x"),
          },
          "mod+v": {
            handler: (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                this.store.pasteComponents(selected[0]);
              }
            },
            description: this.$t("hotkey.mod+v"),
          },
          "mod+d": {
            handler: (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                this.store.copyComponents(selected);
                this.store.pasteComponents(selected[0]);
              }
            },
            description: this.$t("hotkey.mod+d"),
          },
          "mod+l": {
            handler: (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                const master = selected[0];
                const locked = this.store.isComponentLocked(master);
                this.store[`${locked ? "un" : ""}lockComponents`](selected);
              }
            },
            description: this.$t("hotkey.mod+l"),
          },
          delete: {
            handler: async (evt) => {
              evt.preventDefault();
              if (evt.repeat) return;
              await this.deleteSelectedComponents();
            },
            description: this.$t("hotkey.delete"),
          },
          backspace: {
            handler: async (evt) => {
              evt.preventDefault();
              if (evt.repeat) return;
              await this.deleteSelectedComponents();
            },
            description: this.$t("hotkey.backspace"),
          },
        },
      };
    },
    cssRulerThikness() {
      return `${this.rulerThikness}px`;
    },
  },
  watch: {
    preview: {
      handler(value) {
        if (value) {
          this.startIdleTimeTracking();

          if (this.appEl) {
            this.appEl.focus();
          }
        } else {
          this.stopIdleTimeTracking();
        }
      },
      immediate: true,
    },
    appWidth() {
      this.updateRects();
    },
    appHeight() {
      this.updateRects();
    },
    activeScenario() {
      this.store.deselectAllComponents();
    },
  },
  async mounted() {
    await this.$nextTick();

    this._resize_observer = new ResizeObserver(
      debounce(() => {
        this.updateRects();
      }, 500)
    );
    this._resize_observer.observe(this.$el);
    this.updateRects();

    this.appPreviewEl = this.$el;
    this.appRendererWrapperEl = this.$refs["app-renderer-wrapper"];
    this.controlboxContainer = this.$refs["controlbox-container"];
  },
  beforeUnmount() {
    if (this._resize_observer) {
      this._resize_observer.disconnect();
    }

    this.appPreviewEl = null;
    this.appRendererWrapperEl = null;
    this.controlboxContainer = null;
  },
  methods: {
    onAppRendererTransitionend() {
      this.updateRects();
    },
    onAppRendererKeydown(evt) {
      // Prevent keydown events from propagting
      // to the rest of the editor if in preview.
      if (this.previewPersistant) evt.stopPropagation();
    },
    onAppRendererKeyup(evt) {
      // Prevent keyup events from propagting
      // to the rest of the editor if in preview.
      if (this.previewPersistant) evt.stopPropagation();
    },
    updateRects() {
      this.appPreviewRect = this.$el.getBoundingClientRect();
      this.appRendererWrapperRect =
        this.$refs["app-renderer-wrapper"].getBoundingClientRect();
    },
    async deleteSelectedComponents() {
      const selected = this.store.getSelectedComponents;
      this.startHistoryGroup();
      for (const component of selected) {
        if (component.type !== "Scenario") {
          await this.deleteComponent(component);
        }
      }
      this.endHistoryGroup();
    },
  },
};
</script>

<style lang="scss" scoped>
.app-preview {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns:
    v-bind(cssRulerThikness)
    1fr min-content 1fr
    v-bind(cssRulerThikness);
  grid-template-rows:
    v-bind(cssRulerThikness)
    1fr min-content 1fr
    v-bind(cssRulerThikness);
  box-sizing: border-box;
  overflow: auto;
}

.preview-ruler {
  position: sticky;
  z-index: 1;
  background: var(--metascore-color-bg-secondary);
  overflow: hidden;

  &[data-axis="x"] {
    top: 0;
    grid-area: 1/1/2/6;
  }

  &[data-axis="y"] {
    left: 0;
    grid-area: 1/1/6/2;
  }
}

.rulers-corner {
  position: sticky;
  top: 0;
  left: 0;
  width: v-bind(cssRulerThikness);
  height: v-bind(cssRulerThikness);
  margin-left: calc(-1 * v-bind(cssRulerThikness));
  margin-top: calc(-1 * v-bind(cssRulerThikness));
  background: var(--metascore-color-bg-secondary);
  z-index: 3;
}

.app-renderer-wrapper {
  position: relative;
  grid-area: 3/3/4/4;
  background: var(--metascore-color-white);
  transform-origin: 0 0;
  transition: all 0.25s;
  color: initial;
}

.controlbox-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
</style>
