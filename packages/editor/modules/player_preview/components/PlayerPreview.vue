<template>
  <div class="player-preview">
    <iframe src="about:blank" @load="onIframeLoad"></iframe>
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
    async onIframeLoad(evt) {
      const iframe = evt.target;
      const doc = evt.target.contentDocument;

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

      doc.addEventListener("mousemove", this.bubbleIframeEvent.bind(iframe));

      this.$emit("load", { iframe });
    },
  },

  /**
   * Bubble an event up from inside the iframe to the iframe element
   * @param {HTMLElement} iframe The iframe element
   * @param {Event} evt The event to bubble
   */
  bubbleIframeEvent(iframe, evt) {
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
