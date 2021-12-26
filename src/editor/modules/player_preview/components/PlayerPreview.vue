<template>
  <iframe
    class="player-preview"
    src="about:blank"
    ref="iframe"
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
      player: null,
    };
  },
  methods: {
    onIframeLoad() {
      if (this.css) {
        const doc = this.$refs.iframe.contentDocument;
        const sheet = doc.createElement("link");
        sheet.rel = "stylesheet";
        sheet.addEventListener("load", () => {
          this.initPlayer();
        });
        sheet.href = this.css;
        doc.head.appendChild(sheet);
      } else {
        this.initPlayer();
      }
    },
    initPlayer() {
      const doc = this.$refs.iframe.contentDocument;
      this.player = new window.metaScore.Player({
        url: this.url,
        el: doc.body,
      });
    },
  },
  unmounted() {
    // TODO: destroy player
  },
};
</script>

<style lang="scss" scoped></style>
