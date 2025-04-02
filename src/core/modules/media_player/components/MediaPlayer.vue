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

<script lang="ts">
import { defineComponent, markRaw, type PropType, type Raw } from "vue";
import { getRendererForMime } from "../utils/media";
import useStore, { type Source } from "../store";
import type { Native as MediaRenderer } from "../renderers";

export default defineComponent ({
  props: {
    /**
     * The media type; audio|video
     */
    type: {
      type: String as PropType<"audio"|"video">,
      default: "audio",
    },

    /**
     * The media source
     */
    source: {
      type: Object as PropType<Source>,
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
      type: String as PropType<"none"|"metadata"|"auto"|null>,
      default: null,
    },
  },
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      renderer: null as Raw<MediaRenderer>|null,
    };
  },
  watch: {
    async source() {
      await this.setupRenderer();
    },
  },
  async mounted() {
    this.store.initElement(this.$refs.media as HTMLMediaElement);
    await this.setupRenderer();
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
});
</script>
