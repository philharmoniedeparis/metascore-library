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
      "mod+a": "Sélectionner tous les composants de même niveau que ceux déjà sélectionnés, ou tous les blocs si aucun composant n’est déjà sélectionné",
      "tab": "Sélectionner le composant suivant",
      "shift+tab": "Sélectionner le composant précédent",
      "mod+c": "Copier le(s) composant(s) sélectionné(s)",
      "mod+v": "Coller le(s) composant(s)",
      "mod+x": "Couper le(s) composant(s) sélectionné(s)",
      "mod+d": "Dupliquer le(s) composant(s) sélectionné(s)",
      "mod+l": "Verrouiller/déverrouiller le(s) composant(s) sélectionné(s)",
      "delete": "Supprimer le(s) composant(s) sélectionné(s)",
      "backspace": "Supprimer le(s) composant(s) sélectionné(s)",
    },
    "contextmenu": {
      "selection": "Sélection ({count} composant) | Sélection ({count} composants)",
      "deselect": "Désélectionner",
      "copy": "Copier",
      "delete": "Supprimer",
      "lock": "Verrouiller",
      "unlock": "Déverrouiller",
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
      "mod+a": "Select all components of the same level as the already selected ones, or all blocks if no components are already selected",
      "tab": "Select the next component",
      "shift+tab": "Select the previous component",
      "mod+c": "Copy selected component(s)",
      "mod+v": "Paste component(s)",
      "mod+x": "Cut selected component(s)",
      "mod+d": "Duplicate selected component(s)",
      "mod+l": "Lock/unlock selected component(s)",
      "delete": "Delete selected component(s)",
      "backspace": "Delete selected component(s)",
    },
    "contextmenu": {
      "selection": "Selection ({count} component) | Selection ({count} components)",
      "deselect": "Deselect",
      "copy": "Copy",
      "delete": "Delete",
      "lock": "Lock",
      "unlock": "Unlock",
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
      <app-renderer ref="app-renderer" v-hotkey="hotkeys" />
      <preview-grid v-show="!preview" />
      <div ref="controlbox-container" class="controlbox-container"></div>
      <snap-guides v-show="!preview" />
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { debounce } from "lodash";
import { trapTabFocus } from "@metascore-library/core/utils/dom";
import { useModule } from "@metascore-library/core/services/module-manager";
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
    } = useModule("app_renderer");

    const { deleteComponent } = useModule("app_components");

    const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
      useModule("history");

    const { addItems: addContextmenuItems } = useModule("contextmenu");

    return {
      store,
      appEl,
      appWidth,
      appHeight,
      deleteComponent,
      startHistoryGroup,
      endHistoryGroup,
      addContextmenuItems,
    };
  },
  data() {
    return {
      appOffset: {
        x: 0,
        y: 0,
      },
    };
  },
  computed: {
    zoom() {
      return this.store.zoom;
    },
    preview() {
      return this.store.preview;
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

              const selected = this.store.getSelectedComponents;
              this.startHistoryGroup();
              for (const component of selected) {
                await this.deleteComponent(component);
              }
              this.endHistoryGroup();
            },
            description: this.$t("hotkey.delete"),
          },
          backspace: {
            handler: async (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.store.getSelectedComponents;
              this.startHistoryGroup();
              for (const component of selected) {
                await this.deleteComponent(component);
              }
              this.endHistoryGroup();
            },
            description: this.$t("hotkey.backspace"),
          },
        },
      };
    },
    contextmenuItems() {
      const items = [];
      const selected = this.store.getSelectedComponents;

      if (selected.length > 0) {
        items.push({
          label: this.$tc("contextmenu.selection", selected.length, {
            count: selected.length,
          }),
          items: [
            {
              label: this.$t("contextmenu.deselect"),
              handler: () => {
                this.store.deselectAllComponents();
              },
            },
            {
              label: this.$t("contextmenu.copy"),
              handler: () => {
                this.store.copyComponents(selected);
              },
            },
            {
              label: this.$t("contextmenu.delete"),
              handler: async () => {
                this.startHistoryGroup();
                for (const component of selected) {
                  await this.deleteComponent(component);
                }
                this.endHistoryGroup();
              },
            },
            {
              label: this.$t("contextmenu.lock"),
              handler: () => {
                this.store.lockComponents(selected);
              },
            },
            {
              label: this.$t("contextmenu.unlock"),
              handler: () => {
                this.store.unlockComponents(selected);
              },
            },
          ],
        });
      }

      return items;
    },
    cssRulerThikness() {
      return `${this.rulerThikness}px`;
    },
  },
  watch: {
    preview(value) {
      if (value && this.appEl) {
        this.appEl.focus();
      }
    },
    appWidth() {
      this.updateRects();
    },
    appHeight() {
      this.updateRects();
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

    this.appRendererWrapperEl = this.$refs["app-renderer-wrapper"];
    this.controlboxContainer = this.$refs["controlbox-container"];
  },
  beforeUnmount() {
    if (this._resize_observer) {
      this._resize_observer.disconnect();
    }

    this.appRendererWrapperEl = null;
    this.controlboxContainer = null;
  },
  methods: {
    onAppRendererTransitionend() {
      this.updateRects();
    },
    updateRects() {
      this.appPreviewRect = this.$el.getBoundingClientRect();
      this.appRendererWrapperRect =
        this.$refs["app-renderer-wrapper"].getBoundingClientRect();
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
  all: initial; // Prevent editor style from affecting app styles.
  position: relative;
  grid-area: 3/3/4/4;
  background: var(--metascore-color-white);
  transform-origin: 0 0;
  transition: all 0.25s;
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
