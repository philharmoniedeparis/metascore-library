<template>
  <teleport v-if="iframeDocument" :to="iframeDocument.body">
    <app-renderer :url="url" />
  </teleport>
  <iframe
    ref="iframe"
    class="player-preview"
    src="about:blank"
    @load="onIframeLoad"
  ></iframe>
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
    },
  },
};
</script>

<style lang="scss" scoped>
.player-preview {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
