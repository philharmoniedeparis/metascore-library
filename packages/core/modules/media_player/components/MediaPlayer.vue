<template>
  <component
    :is="type"
    ref="media"
    :autoplay="autoplay"
    :loop="loop"
    :controls="controls"
    class="media-player"
  />
</template>

<script>
import { markRaw } from "vue";
import { getRendererForMime } from "../utils/media";
import useStore from "../store";

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
    const store = useStore();
    return { store };
  },
  data() {
    return {
      playing: false,
      renderer: null,
      hls: null,
    };
  },
  watch: {
    source() {
      this.setupRenderer();
    },
  },
  mounted() {
    this.store.initElement(this.$refs.media);
    this.setupRenderer();
  },
  beforeUnmount() {
    this.store.initElement(null);
  },
  methods: {
    /**
     * Setup the renderer
     */
    async setupRenderer() {
      if (this.renderer) {
        this.renderer.unmount();
        this.renderer = null;
      }

      const Renderer = getRendererForMime(this.source.mime);
      if (Renderer) {
        this.renderer = markRaw(new Renderer());
        await this.renderer.mount(this.source.url, this.$el);
      } else {
        // @todo: handle no compatible renderer found.
      }
    },
  },
};
</script>
