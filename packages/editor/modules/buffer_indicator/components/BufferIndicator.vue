<template>
  <div class="buffer-indicator" @mousedown="onMousedown" @click="onClick">
    <div
      v-for="range in ranges"
      :key="range.key"
      :style="range.style"
      class="range"
    />
    <div class="playback" :style="playbackStyle" />
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/module-manager";
import { debounce } from "lodash";

export default {
  props: {
    bufferedColor: {
      type: String,
      default: "#7070c5",
    },
    playbackColor: {
      type: String,
      default: "#0000fe",
    },
  },
  setup() {
    const mediaStore = useStore("media");
    return { mediaStore };
  },
  data() {
    return {
      width: 0,
      height: 0,
    };
  },
  computed: {
    mediaReady() {
      return this.mediaStore.ready;
    },
    mediaTime() {
      return this.mediaStore.time;
    },
    mediaDuration() {
      return this.mediaStore.duration;
    },
    mediaBuffered() {
      return this.mediaStore.buffered;
    },
    ranges() {
      const multiplier = this.width / this.mediaDuration;

      return this.mediaBuffered.map(([start, end]) => {
        return {
          key: `${start}-${end}`,
          style: {
            left: `${Math.round(start * multiplier)}px`,
            width: `${Math.round((end - start) * multiplier)}px`,
            backgroundColor: this.bufferedColor,
          },
        };
      });
    },
    playbackWidth() {
      if (!this.mediaReady) {
        return 0;
      }
      return Math.round((this.mediaTime * this.width) / this.mediaDuration);
    },
    playbackStyle() {
      return {
        width: `${this.playbackWidth}px`,
        backgroundColor: this.playbackColor,
      };
    },
  },
  mounted() {
    this._resize_observer = new ResizeObserver(
      debounce(() => {
        this.width = this.$el.clientWidth;
        this.height = this.$el.clientHeight;
      }, 500)
    );
    this._resize_observer.observe(this.$el);

    this.width = this.$el.clientWidth;
    this.height = this.$el.clientHeight;
  },
  beforeUnmount() {
    if (this._resize_observer) {
      this._resize_observer.disconnect();
    }
  },
  methods: {
    seekMediaTo(time) {
      this.mediaStore.seekTo(time);
    },

    /**
     * Get the time in seconds corresponding to an x position in pixels
     * @param {Number} x The x position
     * @return {Number} The corresponding time in seconds
     */
    getTimeAt(x) {
      if (this.mediaReady) {
        return (this.mediaDuration * x) / this.width;
      }

      return 0;
    },

    /**
     * The mousedown event callback
     */
    onMousedown() {
      const doc = this.$el.ownerDocument;
      doc.addEventListener("mousemove", this.onMousemove);
      doc.addEventListener("mouseup", this.onMouseup);
      doc.addEventListener("blur", this.onMouseup);
    },

    /**
     * The mouseup event callback
     */
    onMouseup() {
      const doc = this.$el.ownerDocument;
      doc.removeEventListener("mousemove", this.onMousemove);
      doc.removeEventListener("mouseup", this.onMouseup);
      doc.removeEventListener("blur", this.onMouseup);
    },

    /**
     * The mousemove event callback
     */
    onMousemove(evt) {
      const offset = this.$el.getBoundingClientRect();
      const x = evt.pageX - offset.left;
      const time = this.getTimeAt(x);

      this.seekMediaTo(time);
    },

    /**
     * The click event callback
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onClick(evt) {
      this.onMousemove(evt);
    },
  },
};
</script>

<style lang="scss" scoped>
.buffer-indicator {
  position: relative;
  overflow: hidden;

  .range {
    position: absolute;
    top: 0;
    height: 100%;
  }

  .playback {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
  }
}
</style>
