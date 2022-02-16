<template>
  <div class="player-preview">
    <dynamic-ruler :track-target="iframeBody" />
    <dynamic-ruler axis="y" :track-target="iframeBody" />

    <iframe
      ref="iframe"
      src="about:blank"
      :style="{ width: `${playerWidth}px`, height: `${playerHeight}px` }"
      @load="onIframeLoad"
    ></iframe>
    <teleport v-if="iframeDocument" :to="iframeDocument.body">
      <app-renderer :url="url" />
    </teleport>
  </div>
</template>

<script>
import { mapState } from "vuex";
import DynamicRuler from "./DynamicRuler.vue";

export default {
  components: {
    DynamicRuler,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
    css: {
      type: String,
      default: null,
    },
  },
  emits: ["load"],
  data() {
    return {
      iframeDocument: null,
      iframeBody: null,
    };
  },
  computed: {
    ...mapState("app-renderer", {
      playerWidth: "width",
      playerHeight: "height",
    }),
  },
  methods: {
    async onIframeLoad() {
      const iframe = this.$refs.iframe;
      const doc = iframe.contentDocument;

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
        doc.head.appendChild(link);
      }

      this.iframeDocument = doc;
      this.iframeBody = this.iframeDocument.body;

      doc.addEventListener("mousemove", this.bubbleIframeEvent);

      this.$emit("load", { iframe });
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

      if (evt instanceof MouseEvent) {
        const { left, top } = iframe.getBoundingClientRect();
        init["clientX"] += left;
        init["clientY"] += top;
      }

      const new_evt = new evt.constructor(evt.type, init);

      iframe.dispatchEvent(new_evt);
    },
  },
};
</script>

<style lang="scss" scoped>
.player-preview {
  display: grid;
  width: 100%;
  grid-template-columns: 20px auto min-content auto;
  grid-template-rows: 20px auto min-content auto;
  box-sizing: border-box;

  .dynamic-ruler {
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

  iframe {
    grid-area: 3/3/4/4;
    width: 100%;
    height: 100%;
    border: 0;
  }
}
</style>
