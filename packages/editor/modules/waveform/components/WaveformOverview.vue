<template>
  <div :class="['waveform-overview', { 'has-data': hasData }]">
    <div class="layers" @mousedown="onMousedown" @click="onClick">
      <canvas ref="wave" class="wave" :width="width" :height="height" />
      <canvas
        ref="highlight"
        class="highlight"
        :width="width"
        :height="height"
      />
      <canvas ref="playhead" class="playhead" :width="width" :height="height" />
    </div>
  </div>
</template>

<script>
import { debounce } from "lodash";
import { mapState, mapMutations } from "vuex";

export default {
  props: {
    waveColor: {
      type: String,
      default: "#fff",
    },
    highlightColor: {
      type: String,
      default: "#000",
    },
    playheadWidth: {
      type: Number,
      default: 1,
    },
    playheadColor: {
      type: String,
      default: "#0000fe",
    },
  },
  emits: ["playheadclick"],
  data() {
    return {
      hasData: false,
      resampledData: null,
      range: null,
      width: null,
      height: null,
    };
  },
  computed: {
    ...mapState("media", {
      mediaTime: "time",
      mediaDuration: "duration",
      mediaWaveformData: "waveformData",
    }),
  },
  watch: {
    mediaWaveformData(data) {
      if (data) {
        this.range = 0;
        const channel = data.channel(0);
        for (let index = 0; index < data.length; index++) {
          const min = channel.min_sample(index);
          const max = channel.max_sample(index);
          this.range = Math.max(this.range, Math.abs(min), Math.abs(max));
        }

        const width = Math.min(this.width, this.mediaWaveformData.length);
        this.resampled_data = this.mediaWaveformData.resample({ width: width });

        this.draw();
      }
    },
  },
  mounted() {
    this.$nextTick(function () {
      this._resize_observer = new ResizeObserver(
        debounce(() => {
          this.draw();
        }, 500)
      );
      this._resize_observer.observe(this.$el);

      this.draw();
    });
  },
  beforeUnmount() {
    if (this._resize_observer) {
      this._resize_observer.disconnect();
    }
  },
  methods: {
    ...mapMutations("media", {
      setMediaTime: "setTime",
    }),
    /**
     * Clear all layers
     */
    clear() {
      this.$el.querySelectorAll("canvas").forEach((canvas) => {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, this.width, this.height);
      });
    },
    /**
     * Update all layers
     */
    draw() {
      this.width = this.$el.clientWidth;
      this.height = this.$el.clientHeight;

      this.drawWave();
      this.drawPlayhead();
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

        for (let index = 0; index < this.resampledData.length; index++) {
          const val = channel.min_sample(index);
          context.lineTo(index + 0.5, this.scaleY(val, this.height) + 0.5);
        }

        for (let index = this.resampledData.length - 1; index >= 0; index--) {
          const val = channel.max_sample(index);
          context.lineTo(index + 0.5, this.scaleY(val, this.height) + 0.5);
        }

        context.closePath();
        context.fillStyle = this.waveColor;
        context.fill();
      }
    },

    /**
     * Update the highlight rectangle
     * @param {Number} start The start time in seconds
     * @param {Number} end The end time in seconds
     */
    setHighlight(start, end) {
      const canvas = this.$refs.highlight;
      const context = canvas.getContext("2d");
      const x = this.getPositionAt(start);
      const width = this.getPositionAt(end) - x;

      context.clearRect(0, 0, this.width, this.height);

      context.fillStyle = this.highlightColor;
      context.fillRect(x, 0, width, this.height);
    },
    /**
     * Update the playhead layer
     */
    drawPlayhead() {
      const canvas = this.$refs.playhead;
      const context = canvas.getContext("2d");
      const x = Math.round(this.getPositionAt(this.mediaTime)) + 0.5;

      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, this.height);
      context.lineWidth = this.playheadWidth;
      context.strokeStyle = this.playheadColor;
      context.stroke();
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
      const range = this._wave_range * 2;
      const offset = this._wave_range;

      return height - ((amplitude + offset) * height) / range;
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
      if (!this.resampledData) {
        return;
      }

      const offset = this.$el.getBoundingClientRect();
      const x = evt.pageX - offset.left;
      const time = this.getTimeAt(x);

      this.setMediaTime(time);

      this.$emit("playheadclick", { time });
    },
    /**
     * The click event callback
     * @param {MouseEvent} evt The event object
     */
    onClick(evt) {
      this.onMousemove(evt);
    },
  },
};
</script>

<style lang="scss" scoped>
.waveform-overview {
  position: relative;

  .layers {
    overflow: hidden;
    position: relative;
    height: 100%;

    canvas {
      position: absolute;
      top: 0;
      left: 0;

      &.highlight {
        opacity: 0.33;
      }
    }
  }
}
</style>
