<template>
  <teleport v-if="iframeDocument" :to="iframeDocument.body">
    <player-app :url="url" />
  </teleport>
  <iframe
    class="player-preview"
    src="about:blank"
    ref="iframe"
    @load="onIframeLoad"
  ></iframe>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  components: {
    PlayerApp: defineAsyncComponent(() =>
      import(
        /* webpackChunkName: "Editor.PlayerApp" */ "../../../../PlayerApp.vue"
      )
    ),
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
  data() {
    return {
      iframeDocument: null,
    };
  },
  methods: {
    async onIframeLoad() {
      this.iframeDocument = this.$refs.iframe.contentDocument;
    },
  },
};
</script>
