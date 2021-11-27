<template>
  <component
    :is="type"
    ref="media"
    :autoplay="autoplay"
    :loop="loop"
    :controls="controls"
    class="media-player"
    @timeupdate="_onTimeupdate"
    @play="_onPlay"
    @pause="_onPause"
    @stop="_onStop"
    @seeked="_onSeeked"
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
     * The media sources
     */
    sources: {
      type: Array,
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

    /**
     * Whether to use requestAnimationFrame for more timeupdate precision
     */
    useRequestAnimationFrame: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["ready", "timeupdate"],
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
      this._setupMedia();
    },
  },
  mounted() {
    this._setupMedia();
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
     * Setup the media
     * @private
     */
    async _setupMedia() {
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
        await this._setupRenderer(renderer, source.src);

        if (renderer) {
          break;
        }
      }

      this.$emit("ready");
    },

    /**
     * Setup a renderer
     * @private
     * @param {String} type The renderer type
     * @param {String} url The media url
     */
    async _setupRenderer(type, url) {
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
     * The 'timeupdate' event handler
     * @private
     */
    _onTimeupdate(evt) {
      if (this.useRequestAnimationFrame) {
        evt.stopImmediatePropagation();
      }
    },

    /**
     * The 'play' event handler
     * @private
     */
    _onPlay() {
      this.playing = true;
      this.triggerTimeUpdate();
    },

    /**
     * The 'pasue' event handler
     * @private
     */
    _onPause() {
      this.playing = false;
      this.triggerTimeUpdate(false);
    },

    /**
     * The 'stop' event handler
     * @private
     */
    _onStop() {
      this.playing = false;
      this.triggerTimeUpdate(false);
    },

    /**
     * The 'seeked' event handler
     * @private
     */
    _onSeeked() {
      if (!this.playing) {
        this.triggerTimeUpdate(false);
      }
    },

    /**
     * Trigger a manual 'timeupdate' event
     * @private
     * @param {boolean} repeat Whether to repeatedly execute using requestAnimationFrame
     */
    _triggerTimeUpdate(repeat = true) {
      if (!this.useRequestAnimationFrame) {
        return;
      }

      if (repeat !== false && this.playing) {
        window.requestAnimationFrame(this.triggerTimeUpdate);
      }

      this.$emit("timeupdate");
    },
  },
};
</script>
