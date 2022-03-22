<i18n>
{
  "fr": {
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
  <div class="player-preview">
    <preview-ruler
      v-show="!preview"
      :track-target="iframeBody"
      :major-tick-length="rulerThikness"
      :offset="playerOffset.x"
    />
    <preview-ruler
      v-show="!preview"
      axis="y"
      :track-target="iframeBody"
      :major-tick-length="rulerThikness"
      :offset="playerOffset.y"
    />
    <div v-show="!preview" class="rulers-corner" />

    <div
      ref="iframe-wrapper"
      class="iframe-wrapper"
      :style="iFrameWrapperStyle"
      @transitionend="onIframeTransitionend"
    >
      <preview-grid v-show="!preview" />

      <iframe ref="iframe" src="about:blank" @load="onIframeLoad"></iframe>
    </div>

    <teleport v-if="iframeDocument" :to="iframeDocument.body">
      <app-renderer v-hotkey="hotkeys" />
    </teleport>
  </div>
</template>

<script>
import { debounce } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import useEditorStore from "@metascore-library/editor/store";
import "../polyfills/GeomertyUtils";
import useStore from "../store";
import PreviewRuler from "./PreviewRuler.vue";
import PreviewGrid from "./PreviewGrid.vue";

export default {
  components: {
    PreviewRuler,
    PreviewGrid,
  },
  props: {
    css: {
      type: String,
      default: null,
    },
    rulerThikness: {
      type: Number,
      default: 20,
    },
  },
  emits: ["load"],
  setup() {
    const store = useStore();
    const editorStore = useEditorStore();
    const appRendererStore = useModule("app_renderer").useStore();
    const contextmenuStore = useModule("contextmenu").useStore();
    return {
      store,
      appRendererStore,
      editorStore,
      contextmenuStore,
    };
  },
  data() {
    return {
      iframeDocument: null,
      iframeBody: null,
      playerOffset: {
        x: 0,
        y: 0,
      },
    };
  },
  computed: {
    playerWidth() {
      return this.appRendererStore.width;
    },
    playerHeight() {
      return this.appRendererStore.height;
    },
    zoom() {
      return this.store.zoom;
    },
    preview() {
      return this.store.preview;
    },
    iFrameWrapperStyle() {
      if (this.zoom !== 1) {
        const width = this.playerWidth * this.zoom;
        const height = this.playerHeight * this.zoom;

        return {
          width: `${this.playerWidth}px`,
          height: `${this.playerHeight}px`,
          transform: `scale(${this.zoom})`,
          marginRight: `${width - this.playerWidth - this.rulerThikness}px`,
          marginBottom: `${height - this.playerHeight - this.rulerThikness}px`,
        };
      }

      return {
        width: `${this.playerWidth}px`,
        height: `${this.playerHeight}px`,
        marginRight: `${-this.rulerThikness}px`,
        marginBottom: `${-this.rulerThikness}px`,
      };
    },
    hotkeys() {
      if (this.preview) {
        return {};
      }

      return {
        right: () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.moveComponents(selected, { left: 1 });
        },
        "shift+right": () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.moveComponents(selected, { left: 10 });
        },
        left: () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.moveComponents(selected, { left: -1 });
        },
        "shift+left": () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.moveComponents(selected, { left: -10 });
        },
        up: () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.moveComponents(selected, { top: -1 });
        },
        "shift+up": () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.moveComponents(selected, { top: -10 });
        },
        down: () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.moveComponents(selected, { top: 1 });
        },
        "shift+down": () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.moveComponents(selected, { top: 10 });
        },
        tab: () => {
          this.editorStore.moveComponentSelection();
        },
        "shift+tab": () => {
          this.editorStore.moveComponentSelection(true);
        },
        "ctrl+c": () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.copyComponents(selected);
        },
        "ctrl+v": () => {
          // @todo
        },
        "ctrl+x": () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.cutComponents(selected);
        },
        "ctrl+d": () => {
          // @todo
        },
        "ctrl+l": () => {
          const selected = this.editorStore.getSelectedComponents;
          if (selected.length > 0) {
            const master = selected[0];
            const locked = this.editorStore.isComponentLocked(master);
            this.editorStore[`${locked ? "un" : ""}lockComponents`](selected);
          }
        },
        delete: () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.deleteComponents(selected);
        },
        backspace: () => {
          const selected = this.editorStore.getSelectedComponents;
          this.editorStore.deleteComponents(selected);
        },
      };
    },
    contextmenuItems() {
      const items = [];
      const selected = this.editorStore.getSelectedComponents;

      if (selected.length > 0) {
        items.push({
          label: this.$t("contextmenu.selection"),
          items: [
            {
              label: this.$t("contextmenu.deselect"),
              handler: () => {
                this.editorStore.deselectAllComponents();
              },
            },
            {
              label: this.$t("contextmenu.copy"),
              handler: () => {
                this.editorStore.copyComponents(selected);
              },
            },
            {
              label: this.$t("contextmenu.delete"),
              handler: () => {
                this.editorStore.deleteComponents(selected);
              },
            },
            {
              label: this.$t("contextmenu.lock"),
              handler: () => {
                this.editorStore.lockComponents(selected);
              },
            },
            {
              label: this.$t("contextmenu.unlock"),
              handler: () => {
                this.editorStore.unlockComponents(selected);
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
    playerWidth() {
      this.updatePlayerOffset();
    },
    playerHeight() {
      this.updatePlayerOffset();
    },
  },
  mounted() {
    this._resize_observer = new ResizeObserver(
      debounce(() => {
        this.updatePlayerOffset();
      }, 500)
    );
    this._resize_observer.observe(this.$el);
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

        // Find the url of the preloaded CSS link tag
        // (see css.extract options in vue.config.js),
        // and add it to the iframe.
        const preloaded = document.querySelector("link#player-preview");
        if (preloaded) {
          const url = preloaded.getAttribute("href");
          const link = document.createElement("link");
          link.setAttribute("rel", "stylesheet");
          link.setAttribute("type", "text/css");
          link.setAttribute("href", url);
          this.iframeDocument.head.appendChild(link);
        }

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

      this.contextmenuStore.addItems(this.contextmenuItems);

      evt.preventDefault();
      this.bubbleIframeEvent(evt);
    },

    onIframeTransitionend() {
      this.updatePlayerOffset();
    },

    updatePlayerOffset() {
      const iframe_wrapper = this.$refs["iframe-wrapper"];
      const { left, top } = this.$el.getBoundingClientRect();
      const { left: playerLeft, top: playerTop } =
        iframe_wrapper.getBoundingClientRect();

      this.playerOffset = {
        x: playerLeft - left,
        y: playerTop - top,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.player-preview {
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

.preview-grid {
  pointer-events: none;
}

iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
