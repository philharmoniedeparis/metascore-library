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
      "ctrl+a": "Sélectionner tous les composants de même niveau que ceux déjà sélectionnés, ou tous les blocs si aucun composant n'est déjà sélectionné",
      "tab": "Sélectionner le composant suivant",
      "shift+tab": "Sélectionner le composant précédent",
      "ctrl+c": "Copier le(s) composant(s) sélectionné(s)",
      "ctrl+v": "Coller le(s) composant(s)",
      "ctrl+x": "Couper le(s) composant(s) sélectionné(s)",
      "ctrl+d": "Dupliquer le(s) composant(s) sélectionné(s)",
      "ctrl+l": "Verrouiller/déverrouiller le(s) composant(s) sélectionné(s)",
      "delete": "Supprimer le(s) composant(s) sélectionné(s)",
      "backspace": "Supprimer le(s) composant(s) sélectionné(s)",
    },
    "contextmenu": {
      "selection": "Sélection",
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
      "ctrl+a": "Select all components of the same level as the already selected ones, or all blocks if no components are already selected",
      "tab": "Select the next component",
      "shift+tab": "Select the previous component",
      "ctrl+c": "Copy selected component(s)",
      "ctrl+v": "Paste component(s)",
      "ctrl+x": "Cut selected component(s)",
      "ctrl+d": "Duplicate selected component(s)",
      "ctrl+l": "Lock/unlock selected component(s)",
      "delete": "Delete selected component(s)",
      "backspace": "Delete selected component(s)",
    },
    "contextmenu": {
      "selection": "Selection",
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
      :track-target="iframeBody"
      :major-tick-length="rulerThikness"
      :offset="appOffset.x"
    />
    <preview-ruler
      v-show="!preview"
      axis="y"
      :track-target="iframeBody"
      :major-tick-length="rulerThikness"
      :offset="appOffset.y"
    />
    <div v-show="!preview" class="rulers-corner" />

    <div
      ref="iframe-wrapper"
      class="iframe-wrapper"
      :style="iFrameWrapperStyle"
      @transitionend="onIframeTransitionend"
    >
      <iframe
        ref="iframe"
        src="about:blank"
        allow="fullscreen"
        allowfullscreen
        @load="onIframeLoad"
      ></iframe>

      <preview-grid v-show="!preview" />
      <preview-snap-guides v-show="!preview" />
    </div>

    <teleport v-if="iframeDocument" :to="iframeDocument.body">
      <app-renderer v-hotkey="hotkeys" />
    </teleport>
  </div>
</template>

<script>
import { computed } from "vue";
import { debounce } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import "../polyfills/GeomertyUtils";
import useStore from "../store";
import PreviewRuler from "./PreviewRuler.vue";
import PreviewGrid from "./PreviewGrid.vue";
import PreviewSnapGuides from "./PreviewSnapGuides.vue";

export default {
  components: {
    PreviewRuler,
    PreviewGrid,
    PreviewSnapGuides,
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
    const { deleteComponent } = useModule("app_components");
    const { width: appWidth, height: appHeight } = useModule("app_renderer");
    const { addItems: addContextmenuItems } = useModule("contextmenu");
    return {
      store,
      appWidth,
      appHeight,
      deleteComponent,
      addContextmenuItems,
    };
  },
  data() {
    return {
      iframeDocument: null,
      iframeBody: null,
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
    iFrameWrapperStyle() {
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
      if (this.preview) {
        return {};
      }

      return {
        group: this.$t("hotkey.group"),
        keys: {
          right: {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.moveComponents(selected, { left: 1 });
            },
            description: this.$t("hotkey.right"),
          },
          "shift+right": {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.moveComponents(selected, { left: 10 });
            },
            description: this.$t("hotkey.shift+right"),
          },
          left: {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.moveComponents(selected, { left: -1 });
            },
            description: this.$t("hotkey.left"),
          },
          "shift+left": {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.moveComponents(selected, { left: -10 });
            },
            description: this.$t("hotkey.shift+left"),
          },
          up: {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.moveComponents(selected, { top: -1 });
            },
            description: this.$t("hotkey.up"),
          },
          "shift+up": {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.moveComponents(selected, { top: -10 });
            },
            description: this.$t("hotkey.shift+up"),
          },
          down: {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.moveComponents(selected, { top: 1 });
            },
            description: this.$t("hotkey.down"),
          },
          "shift+down": {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.moveComponents(selected, { top: 10 });
            },
            description: this.$t("hotkey.shift+down"),
          },
          tab: {
            handler: () => {
              this.store.moveComponentSelection();
            },
            description: this.$t("hotkey.tab"),
          },
          "shift+tab": {
            handler: () => {
              this.store.moveComponentSelection(true);
            },
            description: this.$t("hotkey.shift+tab"),
          },
          "ctrl+c": {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.copyComponents(selected);
            },
            description: this.$t("hotkey.ctrl+c"),
          },
          "ctrl+v": {
            handler: () => {
              // @todo
            },
            description: this.$t("hotkey.ctrl+v"),
          },
          "ctrl+x": {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              this.store.cutComponents(selected);
            },
            description: this.$t("hotkey.ctrl+x"),
          },
          "ctrl+d": {
            handler: () => {
              // @todo
            },
            description: this.$t("hotkey.ctrl+d"),
          },
          "ctrl+l": {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              if (selected.length > 0) {
                const master = selected[0];
                const locked = this.store.isComponentLocked(master);
                this.store[`${locked ? "un" : ""}lockComponents`](selected);
              }
            },
            description: this.$t("hotkey.ctrl+l"),
          },
          delete: {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              selected.forEach(this.deleteComponent);
            },
            description: this.$t("hotkey.delete"),
          },
          backspace: {
            handler: () => {
              const selected = this.store.getSelectedComponents;
              selected.forEach(this.deleteComponent);
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
          label: this.$t("contextmenu.selection"),
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
              handler: () => {
                selected.forEach(this.deleteComponent);
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
    appWidth() {
      this.updateAppOffset();
    },
    appHeight() {
      this.updateAppOffset();
    },
  },
  mounted() {
    this._resize_observer = new ResizeObserver(
      debounce(() => {
        this.updateAppOffset();
      }, 500)
    );
    this._resize_observer.observe(this.$el);

    this.$nextTick(function () {
      this.store.iframe = this.$refs.iframe;
    });
  },
  beforeUnmount() {
    if (this._resize_observer) {
      this._resize_observer.disconnect();
    }
  },
  methods: {
    async onIframeLoad() {
      this.$nextTick(function () {
        const iframe = this.$refs.iframe;

        this.iframeDocument = iframe.contentDocument;
        this.iframeBody = this.iframeDocument.body;

        // Find all metascore link tags
        // and add them to the iframe.
        document
          .querySelectorAll("link[rel='stylesheet'][data-metascore-library]")
          .forEach((tag) => {
            const url = tag.getAttribute("href");
            const link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", url);
            this.iframeDocument.head.appendChild(link);
          });

        this.iframeDocument.addEventListener("keydown", this.bubbleIframeEvent);
        this.iframeDocument.addEventListener("keyup", this.bubbleIframeEvent);
        this.iframeDocument.addEventListener(
          "mousemove",
          this.bubbleIframeEvent
        );
        this.iframeBody.addEventListener(
          "contextmenu",
          this.onIframeContextMenu
        );

        this.$emit("load", { iframe });
      });
    },

    /**
     * Bubble an event up from inside the iframe to the iframe element
     * @param {Event} evt The event to bubble
     */
    bubbleIframeEvent(evt) {
      const iframe = this.$refs.iframe;
      const init = {};

      for (let prop in evt) {
        init[prop] = evt[prop];
      }

      if ("clientX" in evt) {
        const { left, top } = iframe.getBoundingClientRect();
        init["clientX"] += left;
        init["clientY"] += top;
      }

      if ("pageX" in evt) {
        const { x: pageX, y: pageY } = window.convertPointFromNodeToPage(
          iframe,
          evt.pageX,
          evt.pageY
        );

        init["pageX"] = pageX;
        init["pageY"] = pageY;
      }

      const new_evt = new evt.constructor(evt.type, init);

      if (!iframe.dispatchEvent(new_evt)) {
        // Cancel original event if bubbled event was canceled.
        evt.preventDefault();
      }
    },

    onIframeContextMenu(evt) {
      // Show the native menu if the Ctrl key is down.
      if (evt.ctrlKey) {
        return;
      }

      this.addContextmenuItems(this.contextmenuItems);

      evt.preventDefault();
      this.bubbleIframeEvent(evt);
    },

    onIframeTransitionend() {
      this.updateAppOffset();
    },

    updateAppOffset() {
      const iframe_wrapper = this.$refs["iframe-wrapper"];
      const { left, top } = this.$el.getBoundingClientRect();
      const { left: appLeft, top: appTop } =
        iframe_wrapper.getBoundingClientRect();

      this.appOffset = {
        x: appLeft - left,
        y: appTop - top,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.app-preview {
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

.iframe-wrapper {
  position: relative;
  grid-area: 3/3/4/4;
  background: $white;
  transform-origin: 0 0;
  transition: all 0.25s;
}

.preview-ruler {
  position: sticky;
  z-index: 1;
  background: $mediumgray;
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
  position: absolute;
  top: 0;
  left: 0;
  width: v-bind(cssRulerThikness);
  height: v-bind(cssRulerThikness);
  background: $mediumgray;
  z-index: 3;
}

iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
