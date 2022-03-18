<template>
  <div class="waveform--overview">
    <div class="layers" @mousedown="onMousedown" @click="onClick">
      <canvas ref="wave" class="wave" :width="width" :height="height" />
      <div class="highlight" :style="highlightStyle"></div>
      <div class="playhead" :style="playheadStyle"></div>
    </div>
  </div>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";
import { debounce } from "lodash";
import useStore from "../store";

export default {
  props: {
    waveColor: {
      type: String,
      default: "#fff",
    },
    highlightColor: {
      type: String,
      default: "rgba(0, 0, 0, 0.2)",
    },
    playheadWidth: {
      type: Number,
      default: 2,
    },
    playheadColor: {
      type: String,
      default: "#0000fe",
    },
  },
  setup() {
    const store = useStore();
    const mediaStore = useModule("Media").useStore();
    return { store, mediaStore };
  },
  data() {
    return {
      width: 0,
      height: 0,
    };
  },
  computed: {
    mediaTime() {
      return this.mediaStore.time;
    },
    mediaDuration() {
      return this.mediaStore.duration;
    },
    waveformData() {
      return this.store.data;
    },
    waveformRange() {
      return this.store.range;
    },
    waveformOffset() {
      return this.store.offset;
    },
    resampledData() {
      if (this.waveformData && this.width > 0) {
        const width = Math.min(this.width, this.waveformData.length);
        return this.waveformData.resample({ width });
      }

      return null;
    },
    highlightStyle() {
      const { start, end } = this.waveformOffset;
      let style = { backgroundColor: this.highlightColor };

      if (start !== null && end !== null) {
        const left = this.getPositionAt(start);
        const width = this.getPositionAt(end) - left;

        style = { ...style, width: `${width}px`, left: `${left}px` };
      }

      return style;
    },
    playheadPosition() {
      return Math.round(this.getPositionAt(this.mediaTime));
    },
    playheadStyle() {
      return {
        borderRight: `${this.playheadWidth}px solid ${this.playheadColor}`,
        left: `${this.playheadPosition - this.playheadWidth / 2}px`,
      };
    },
  },
  watch: {
    height() {
      this.$nextTick(function () {
        this.drawWave();
      });
    },
    resampledData() {
      this.$nextTick(function () {
        this.drawWave();
      });
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
      delete this._resize_observer;
    }
  },
  methods: {
    seekMediaTo(time) {
      this.mediaStore.seekTo(time);
    },
    /**
     * Update the wave layer
     */
    drawWave() {
      const canvas = this.$refs.wave;
      const context = canvas.getContext("2d");

      context.clearRect(0, 0, this.width, this.height);

      if (this.resampledData) {
        const channel = this.resampledData.channel(0);

        context.beginPath();

        // Loop forwards, drawing the upper half of the waveform
        for (let x = 0; x < this.resampledData.length; x++) {
          const val = channel.max_sample(x);
          context.lineTo(x + 0.5, this.scaleY(val, this.height) + 0.5);
        }

        // Loop backwards, drawing the lower half of the waveform
        for (let x = this.resampledData.length - 1; x >= 0; x--) {
          const val = channel.min_sample(x);
          context.lineTo(x + 0.5, this.scaleY(val, this.height) + 0.5);
        }

        context.closePath();
        context.fillStyle = this.waveColor;
        context.fill();
      }
    },

    /**
     * Get the time in seconds corresponding to an x position in pixels
     * @param {Number} x The x position
     * @return {Number} The corresponding time in seconds
     */
    getTimeAt(x) {
      if (this.resampledData) {
        return this.resampledData.time(x);
      }

      return (this.mediaDuration * x) / this.width;
    },

    /**
     * Get the x position in pixels corresponding to a time in seconds
     * @param {Number} time The time in seconds
     * @return {Number} The corresponding x position
     */
    getPositionAt(time) {
      if (this.resampledData) {
        return this.resampledData.at_time(time);
      }

      return this.mediaDuration
        ? (time * this.width) / this.mediaDuration
        : null;
    },

    /**
     * Rescale an amplitude value to a given hight
     * @param {Number} amplitude The waveform data point amplitude
     * @param {Number} height The height of the drawing surface in pixels
     * @return {Number} The scaled value
     */
    scaleY(amplitude, height) {
      const range = this.waveformRange * 2;
      const offset = this.waveformRange;

      return height - ((amplitude + offset) * height) / range;
    },

    /**
     * Set the time to the mouse position
     */
    gotToMousePosition(evt) {
      if (!this.resampledData) {
        return;
      }

      const offset = this.$el.getBoundingClientRect();
      const x = evt.pageX - offset.left;
      const time = this.getTimeAt(x);

      this.seekMediaTo(time);
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
      this.gotToMousePosition(evt);
    },

    /**
     * The click event callback
     * @param {MouseEvent} evt The event object
     */
    onClick(evt) {
      this.gotToMousePosition(evt);
    },
  },
};
</script>

<style lang="scss" scoped>
.waveform--overview {
  position: relative;

  .layers {
    position: relative;
    height: 100%;
    overflow: hidden;

    .wave {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .highlight {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .playhead {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
    }
  }
}
</style>
