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
    <preview-ruler :track-target="iframeBody" />
    <preview-ruler axis="y" :track-target="iframeBody" />

    <div
      class="iframe-wrapper"
      :style="{ width: `${playerWidth}px`, height: `${playerHeight}px` }"
    >
      <preview-grid />

      <iframe ref="iframe" src="about:blank" @load="onIframeLoad"></iframe>
    </div>

    <teleport v-if="iframeDocument" :to="iframeDocument.body">
      <app-renderer v-hotkey="hotkeys" />
    </teleport>
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/module-manager";
import "../polyfills/GeomertyUtils";
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
  },
  emits: ["load"],
  setup() {
    const appRendererStore = useStore("app-renderer");
    const editorStore = useStore("editor");
    const contextmenuStore = useStore("contextmenu");
    return {
      appRendererStore,
      editorStore,
      contextmenuStore,
    };
  },
  data() {
    return {
      iframeDocument: null,
      iframeBody: null,
    };
  },
  computed: {
    playerWidth() {
      return this.appRendererStore.width;
    },
    playerHeight() {
      return this.appRendererStore.height;
    },
    hotkeys() {
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
      const selection = this.editorStore.getSelectedComponents;

      if (selection.length > 0) {
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
                this.editorStore.copyComponents(selection);
              },
            },
            {
              label: this.$t("contextmenu.delete"),
              handler: () => {
                this.editorStore.deleteComponents(selection);
              },
            },
            {
              label: this.$t("contextmenu.lock"),
              handler: () => {
                this.editorStore.lockComponents(selection);
              },
            },
            {
              label: this.$t("contextmenu.unlock"),
              handler: () => {
                this.editorStore.unlockComponents(selection);
              },
            },
          ],
        });
      }

      return items;
    },
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
  },
};
</script>

<style lang="scss" scoped>
.player-preview {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 20px auto min-content auto;
  grid-template-rows: 20px auto min-content auto;
  box-sizing: border-box;
}

.iframe-wrapper {
  position: relative;
  grid-area: 3/3/4/4;
  background: $white;
}

.preview-ruler {
  position: sticky;
  z-index: 1;
  background: $mediumgray;

  &[data-axis="x"] {
    top: 0;
    grid-area: 1/2/2/5;
    padding-top: 2px;
  }

  &[data-axis="y"] {
    left: 0;
    grid-area: 2/1/5/2;
    padding-left: 2px;
  }
}

.preview-grid {
  pointer-events: none;
}

iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
