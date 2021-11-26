<template>
  <component
    :is="type"
    ref="media"
    :autoplay="autoplay"
    :loop="loop"
    :controls="controls"
    class="media-player"
    @play="onPlay"
    @pause="onPause"
    @stop="onStop"
  >
    <source
      v-for="(source, index) in sources"
      :key="index"
      :src="source.src"
      :type="source.type"
    />
  </component>
</template>

<script>
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
  props: {
    type: {
      type: String,
      validator(value) {
        return ["audio", "video"].includes(value);
      },
      default: "audio",
    },
    sources: {
      type: Array,
      required: true,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    loop: {
      type: Boolean,
      default: false,
    },
    controls: {
      type: Boolean,
      default: true,
    },
    preload: {
      type: String,
      validator(value) {
        return ["none", "metadata", "auto"].includes(value);
      },
      default: null,
    },
  },
  emits: ["ready"],
  data() {
    return {
      playing: false,
      dash: null,
      hls: null,
    };
  },
  computed: {
    /**
     * Get the media element
     * @return {HTMLMediaElement} The media element
     */
    el() {
      return this.getElement();
    },
  },
  watch: {
    sources() {
      this.setupMedia();
    },
  },
  mounted() {
    this.setupMedia();
  },
  methods: {
    /**
     * Get the media element
     * @return {HTMLMediaElement} The media element
     */
    getElement() {
      return this.$refs.media;
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

      for (const source of this.sources) {
        const renderer = this.getRendererFromType(source.type);
        await this.setupRenderer(renderer, source.src);

        if (renderer) {
          break;
        }
      }

      this.$emit("ready");
    },

    /**
     * Get a renderer type from a source's mime type
     * @param {String} mime The mime type
     * @return {String?} A matching renderer type
     */
    getRendererFromType(mime) {
      let renderer = null;

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
     * Setup a renderer
     * @param {String} type The renderer type
     * @param {String} url The media url
     */
    async setupRenderer(type, url) {
      switch (type) {
        case "dashjs":
          {
            const { default: DashJS } = await import(
              /* webpackChunkName: "vendors/dashjs.bundle" */ "dashjs"
            );
            this.dash = DashJS.MediaPlayer().create();
            this.dash.initialize(this.el, url, true);
          }
          return;

        case "hls.js":
          {
            const { default: Hls } = await import(
              /* webpackChunkName: "vendors/hls.js.bundle" */ "hls.js"
            );
            if (Hls.isSupported()) {
              this.hls = new Hls();
              this.hls.loadSource(url);
              this.hls.attachMedia(this.el);
            }
          }
          return;
      }
    },

    /**
     * Play the media
     * @returns {this}
     */
    play() {
      const promise = this.el.play();

      if (typeof promise !== "undefined") {
        promise.catch((error) => {
          console.error(error);
          console.warn(
            "Play was prevented by the browser. If using the metaScore API, make sure to add allow='autoplay' to the player's iframe. See https://github.com/w3c/webappsec-feature-policy/blob/master/features.md for more information."
          );
        });
      }

      return this;
    },

    /**
     * Pause the media
     * @returns {this}
     */
    pause() {
      this.el.pause();
      return this;
    },

    /**
     * Stop the media
     * @returns {this}
     */
    stop() {
      this.pause().setTime(0);
      return this;
    },

    /**
     * Check whether the media is playing
     * @return {Boolean} Whether the media is playing
     */
    isPlaying() {
      return this.playing;
    },

    /**
     * Set the media time
     * @param {Number} time The time in seconds
     * @returns {this}
     */
    setTime(time) {
      this.el.currentTime = time;
      return this;
    },

    /**
     * Get the current media time
     * @return {Number} The time in seconds
     */
    getTime() {
      return this.el.currentTime;
    },

    /**
     * Get the media's duration
     * @return {Number} The duration in seconds
     */
    getDuration() {
      return this.el.duration;
    },

    /**
     * Get the media's buffered time ranges
     * @return {Array} An array of arrays, each containing a time range
     */
    getBuffered() {
      const buffered = [];

      for (let i = 0; i < this.el.buffered.length; i++) {
        const start_x = this.el.buffered.start(i);
        const end_x = this.el.buffered.end(i);

        buffered.push([start_x, end_x]);
      }

      return buffered;
    },

    /**
     * The 'play' event handler
     */
    onPlay() {
      this.playing = true;
    },

    /**
     * The 'pasue' event handler
     */
    onPause() {
      this.playing = false;
    },

    /**
     * The 'stop' event handler
     */
    onStop() {
      this.playing = false;
    },
  },
};
</script>
