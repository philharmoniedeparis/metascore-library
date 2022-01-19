<template>
  <div class="player-preview">
    <iframe ref="iframe" src="about:blank" @load="onIframeLoad"></iframe>
    <teleport v-if="iframeDocument" :to="iframeDocument.body">
      <app-renderer :url="url" />
    </teleport>
  </div>
</template>

<script>
export default {
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
    };
  },
  methods: {
    async onIframeLoad() {
      const doc = this.$refs.iframe.contentDocument;

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

      this.$emit("load", { iframe: this.$refs.iframe });
    },
  },
};
</script>

<style lang="scss" scoped>
.player-preview {
  height: 100%;

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
}
</style>
