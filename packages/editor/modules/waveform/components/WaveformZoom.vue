<template>
  <div class="waveform-zoom">
    <div v-if="message" class="message">{{ message }}</div>
    <div
      class="layers"
      @mousedown="onMousedown"
      @wheel.prevent="onWheel"
      @click="onClick"
    >
      <canvas ref="wave" class="wave" :width="width" :height="height" />
      <canvas ref="axis" class="axis" :width="width" :height="height" />
      <div class="playhead" :style="playheadStyle"></div>
    </div>
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/module-manager";
import { debounce } from "lodash";
import { formatTime } from "@metascore-library/core/utils/media";

export default {
  props: {
    waveColor: {
      type: String,
      default: "#eee",
    },
    waveMargin: {
      type: Number,
      default: 20,
    },
    axisTickWidth: {
      type: Number,
      default: 1,
    },
    axisTickHeight: {
      type: Number,
      default: 6,
    },
    axisTickColor: {
      type: String,
      default: "#fff",
    },
    axisTextColor: {
      type: String,
      default: "#fff",
    },
    axisFont: {
      type: String,
      default: "11px sans-serif",
    },
    playheadWidth: {
      type: Number,
      default: 2,
    },
    playheadColor: {
      type: String,
      default: "#0000fe",
    },
    zoomStep: {
      type: Number,
      default: 32,
    },
  },
  setup() {
    const store = useStore("waveform");
    const mediaStore = useStore("media");
    return { store, mediaStore };
  },
  data() {
    return {
      width: 0,
      height: 0,
      resampledData: null,
      offset: 0,
      mousedownX: null,
      dragging: false,
      message: null,
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
    waveformScale() {
      return this.store.scale;
    },
    waveformMinScale() {
      return this.store.minSclae;
    },
    waveformMaxScale() {
      return this.store.maxScale;
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
        this.resampleData();
      });
    },
    width() {
      this.$nextTick(function () {
        this.resampleData();
        this.setWaveformMaxScale(this.resampledData?.scale);
      });
    },
    waveformData(value) {
      this.$nextTick(function () {
        this.setWaveformMinScale(value?.scale);
        this.resampleData();
      });
    },
    waveformScale() {
      this.$nextTick(function () {
        this.resampleData();
      });
    },
    mediaTime() {
      if (this.resampledData && !this.dragging) {
        const x = this.playheadPosition;
        // If the playhead is outside of the view area, update the offset.
        if (
          x < 0 ||
          (x > this.width - 10 &&
            this.resampledData.length > this.offset + this.width)
        ) {
          this.offset += x - 10;
        }
      }
    },
    resampledData(value) {
      this.setWaveformScale(value?.scale);
      this.offset = 0;

      this.$nextTick(function () {
        this.drawWave();
        this.drawAxis();
      });
    },
    offset() {
      this.drawWave();
      this.drawAxis();

      this.setWaveformOffset({
        start: this.getTimeAt(0),
        end: this.getTimeAt(this.width),
      });
    },
  },
  mounted() {
    this._resize_observer = new ResizeObserver(
      debounce(() => {
        this.width = this.$el.clientWidth;
        this.height = this.$el.clientHeight;
      }, 100)
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
    setWaveformOffset({ start, end }) {
      this.store.offset = { start, end };
    },
    setWaveformScale(scale) {
      this.store.scale = scale;
    },
    setWaveformMinScale(scale) {
      this.store.minScale = scale;
    },
    setWaveformMaxScale(scale) {
      this.store.maxScale = scale;
    },
    resampleData() {
      console.log("> resampleData");
      if (this.waveformData && this.width > 0) {
        if (!this.resampledData) {
          this.resampledData = this.waveformData.resample({
            width: this.width,
          });
          return;
        }

        if (
          this.waveformScale !== null &&
          this.resampledData.scale !== this.waveformScale
        ) {
          console.log("scale", this.waveformScale);
          this.resampledData = this.waveformData.resample({
            scale: this.waveformScale,
          });
          return;
        }

        if (this.width < this.resampledData.length) {
          console.log("width");
          this.resampledData = this.waveformData.resample({
            width: this.width,
          });
        }
      }
      console.log("< resampleData");
    },

    /**
     * Update the wave layer
     */
    drawWave() {
      //console.log("drawWave");
      if (this.width > 0 && this.height > 0) {
        const canvas = this.$refs.wave;
        const context = canvas.getContext("2d");

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();

        if (this.resampledData) {
          const channel = this.resampledData.channel(0);
          const margin = this.waveMargin;
          const height = this.height - margin * 2;
          const startX = this.offset;
          const endX = Math.min(startX + this.width, this.resampledData.length);

          // Loop forwards, drawing the upper half of the waveform
          for (let x = endX - 1; x >= startX; x--) {
            const val = channel.max_sample(x);
            context.lineTo(
              x - startX + 0.5,
              this.scaleY(val, height) + margin + 0.5
            );
          }

          // Loop backwards, drawing the lower half of the waveform
          for (let x = startX; x < endX; x++) {
            const val = channel.min_sample(x);
            context.lineTo(
              x - startX + 0.5,
              this.scaleY(val, height) + margin + 0.5
            );
          }

          context.closePath();
          context.fillStyle = this.waveColor;
          context.fill();
        }
      }

      //console.log("> drawWave");
    },

    /**
     * Update the axis layer.
     */
    drawAxis() {
      //console.log("drawAxis");
      if (this.width > 0 && this.height > 0) {
        const canvas = this.$refs.axis;
        const context = canvas.getContext("2d");
        const step = this.getAxisStep();

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();

        if (step !== null) {
          context.strokeStyle = this.axisTickColor;
          context.lineWidth = this.axisTickWidth;
          context.font = this.axisFont;
          context.fillStyle = this.axisTextColor;
          context.textAlign = "center";
          context.textBaseline = "bottom";

          let startTime = this.getTimeAt(0) + step;
          startTime -= startTime % step;

          let endTime = this.getTimeAt(this.width);
          endTime += endTime % step;

          for (let time = startTime; time < endTime; time += step) {
            const x = this.getPositionAt(time) + 0.5;
            const text = formatTime(time);

            context.moveTo(x, 0);
            context.lineTo(x, this.axisTickHeight);
            context.stroke();
            context.moveTo(x, this.height);
            context.lineTo(x, this.height - this.axisTickHeight);
            context.stroke();
            context.fillText(text, x, this.height - this.axisTickHeight);
          }
        }
      }
    },

    /**
     * Returns number of seconds for each axis tick, appropriate for the
     * current zoom level, ensuring that ticks are not too close together
     * and that ticks are placed at intuitive time intervals (i.e., every 1,
     * 2, 5, 10, 20, 30 seconds, then every 1, 2, 5, 10, 20, 30 minutes, then
     * every 1, 2, 5, 10, 20, 30 hours).
     *
     * Credit: peaks.js (see src/main/waveform/waveform.axis.js:getAxisLabelScale)
     *
     * @return {Number} The number of seconds for each axis tick
     */
    getAxisStep() {
      //console.log("getAxisStep");
      const min_spacing = 60;
      const steps = [1, 2, 5, 10, 20, 30];
      let index = 0;
      let base = 1;
      let step = base;

      for (;;) {
        step = base * steps[index];
        const pixels = this.timeToPixels(step);

        if (pixels === null) {
          return null;
        }

        if (pixels < min_spacing) {
          if (++index === steps.length) {
            base *= 60; // seconds -> minutes -> hours
            index = 0;
          }
        } else {
          break;
        }
      }

      return step;
    },

    /**
     * Set the current zoom
     * @param {Number} scale The zoom scale to set
     */
    setZoom(scale) {
      if (this.resampledData && this.width) {
        const clamped = Math.min(
          Math.max(parseInt(scale, 10), this.waveformMinScale),
          this.waveformMaxScale
        );

        this.setWaveformScale(clamped);
      }
    },

    /**
     * Update the offset in order to put the playhead's position at the center
     * @param {Number} time The time in seconds to center to
     */
    centerToTime(time) {
      //console.log("centerToTime");
      if (this.resampledData && this.width > 0) {
        this.offset = this.resampledData.at_time(time) - this.width / 2;
      }
    },

    /**
     * Get the time in seconds corresponding to an x position in pixels
     * @param {Number} x The x position
     * @return {Number} The corresponding time in seconds
     */
    getTimeAt(x) {
      //console.log("getTimeAt");
      if (this.resampledData) {
        return this.resampledData.time(x + this.offset);
      }

      if (this.mediaDuration) {
        return (x * this.mediaDuration) / this.width;
      }

      return null;
    },

    /**
     * Get the x position in pixels corresponding to a time in seconds
     * @param {Number} time The time in seconds
     * @return {Number} The corresponding x position
     */
    getPositionAt(time) {
      if (this.resampledData) {
        return this.resampledData.at_time(time) - this.offset;
      }

      if (this.mediaDuration) {
        return Math.round((time / this.mediaDuration) * this.width);
      }

      return null;
    },

    /**
     * Get number of pixels corresponding to a period of time
     * @param {Number} time The time in seconds
     * @return {Number} The corresponding pixel size
     */
    timeToPixels(time) {
      //console.log("timeToPixels");
      if (this.resampledData) {
        return Math.floor(
          (time * this.resampledData.sample_rate) / this.resampledData.scale
        );
      } else if (this.mediaDuration) {
        return Math.round((time / this.mediaDuration) * this.width);
      }

      return null;
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
     * Zoom in
     */
    zoomIn() {
      if (this.resampledData) {
        this.setZoom(this.resampledData.scale - this.zoomStep);
      }
    },

    /**
     * Zoom out
     *
     * @return {this}
     */
    zoomOut() {
      if (this.resampledData) {
        this.setZoom(this.resampledData.scale + this.zoomStep);
      }
    },

    /**
     * The mousedown event callback
     * @param {MouseEvent} evt The event object
     */
    onMousedown(evt) {
      this.mousedownX = evt.clientX;

      const doc = this.$el.ownerDocument;
      doc.addEventListener("mousemove", this.onMousemove);
      doc.addEventListener("mouseup", this.onMouseup);
      doc.addEventListener("blur", this.onMouseup);
    },

    /**
     * The mouseup event callback
     */
    onMouseup() {
      this.mousedownX = null;

      const doc = this.$el.ownerDocument;
      doc.removeEventListener("mousemove", this.onMousemove);
      doc.removeEventListener("mouseup", this.onMouseup);
      doc.removeEventListener("blur", this.onMouseup);
    },

    /**
     * The mousemove event callback
     * @param {MouseEvent} evt The event object
     */
    onMousemove(evt) {
      if (!this.resampledData || evt.clientX === this.mousedownX) {
        return;
      }

      this.dragging = true;

      this.offset += this._mousedown_x - evt.clientX;
      this.mousedownX = evt.clientX;
    },

    /**
     * The wheel event handler
     * @param {Event} evt The event object
     */
    onWheel(evt) {
      if (evt.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    },

    /**
     * The click event handler
     * @param {Event} evt The event object
     */
    onClick(evt) {
      if (!this.resampledData) {
        return;
      }

      if (!this.dragging) {
        const { left } = evt.target.getBoundingClientRect();
        const x = evt.pageX - left;
        const time = this.getTimeAt(x);

        this.seekMediaTo(time);
      } else {
        this.dragging = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.waveform-zoom {
  position: relative;

  .message {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    color: $white;
    transform: translateY(-50%);
    text-align: center;
  }

  .layers {
    position: relative;
    height: 100%;
    overflow: hidden;

    canvas {
      position: absolute;
      top: 0;
      left: 0;
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
