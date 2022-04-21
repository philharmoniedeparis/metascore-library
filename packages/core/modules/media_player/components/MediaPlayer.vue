<template>
  <component
    :is="type"
    ref="media"
    :autoplay="autoplay"
    :loop="loop"
    :controls="controls"
    class="media-player"
  >
    <source :src="source.url" :type="source.mime" />
  </component>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";

const dash_types = ["application/dash+xml"];
const hls_types = [
  "application/mpegurl",
  "application/x-mpegurl",
  "application/vnd.apple.mpegurl",
  "application/vnd.apple.mpegurl.audio",
  "audio/mpegurl",
  "audio/x-mpegurl",
  "audio/hls",
  "video/mpegurl",
  "video/x-mpegurl",
  "video/hls",
];

export default {
  name: "MediaPlayer",
  props: {
    /**
     * The media type; audio|video
     */
    type: {
      type: String,
      validator(value) {
        return ["audio", "video"].includes(value);
      },
      default: "audio",
    },

    /**
     * The media source
     */
    source: {
      type: Object,
      required: true,
    },

    /**
     * Whether to autoplay
     */
    autoplay: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether to loop playback
     */
    loop: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether to display controls
     */
    controls: {
      type: Boolean,
      default: true,
    },

    /**
     * Indicate what data should be preloaded
     */
    preload: {
      type: String,
      validator(value) {
        return ["none", "metadata", "auto"].includes(value);
      },
      default: null,
    },
  },
  setup() {
    const mediaStore = useModule("media_player").useStore();
    return { mediaStore };
  },
  data() {
    return {
      playing: false,
      dash: null,
      hls: null,
    };
  },
  watch: {
    source() {
      this.setupMedia();
    },
  },
  mounted() {
    this.mediaStore.initElement(this.$refs.media);
    this.setupMedia();
  },
  beforeUnmount() {
    this.mediaStore.initElement(null);
  },
  methods: {
    /**
     * Get a renderer type from a source's mime type
     * @param {String} mime The mime type
     * @return {String?} A matching renderer type
     */
    getRendererFromType(mime) {
      let renderer = null;

      mime = mime.toLowerCase();

      if (new Audio().canPlayType(mime)) {
        renderer = "html5";
      } else if (dash_types.includes(mime)) {
        renderer = "dashjs";
      } else if (hls_types.includes(mime)) {
        renderer = "hls.js";
      }

      return renderer;
    },

    /**
     * Setup the media
     */
    async setupMedia() {
      if (this.dash) {
        this.dash.destroy();
        this.dash = null;
      }
      if (this.hls) {
        this.hls.detachMedia();
        this.hls = null;
      }

      const renderer = this.getRendererFromType(this.source.mime);
      await this.setupRenderer(renderer, this.source.url);

      this.$el.load();
    },

    /**
     * Setup a renderer
     * @param {String} type The renderer type
     * @param {String} url The media url
     */
    async setupRenderer(type, url) {
      switch (type) {
        case "dashjs":
          {
            const { default: DashJS } = await import(
              /* webpackChunkName: "vendors.dashjs" */
              /* webpackExports: ["default"] */
              "dashjs"
            );
            this.dash = DashJS.MediaPlayer().create();
            this.dash.initialize(this.$el, url, true);
          }
          return;

        case "hls.js":
          {
            const { default: Hls } = await import(
              /* webpackChunkName: "vendors.hls.js" */
              /* webpackExports: ["default"] */
              "hls.js"
            );
            if (Hls.isSupported()) {
              this.hls = new Hls();
              this.hls.loadSource(url);
              this.hls.attachMedia(this.$el);
            }
          }
          return;
      }
    },
  },
};
</script>
