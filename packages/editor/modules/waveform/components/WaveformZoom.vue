<template>
  <div class="waveform-zoom">
    <div v-if="message" class="message">{{ message }}</div>
    <div
      class="layers"
      @mousedown="onMousedown"
      @mousewheel.prevent="onMouseWheel"
      @click="onClick"
    >
      <canvas ref="wave" class="wave" :width="width" :height="height" />
      <canvas ref="axis" class="axis" :width="width" :height="height" />
      <div class="playhead" :style="playheadStyle"></div>
    </div>
  </div>
</template>

<script>
import { debounce } from "lodash";
import { mapState, mapMutations, mapActions } from "vuex";
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
  },
  data() {
    return {
      width: 0,
      height: 0,
      offset: 0,
      mousedownX: null,
      dragging: false,
      message: null,
    };
  },
  computed: {
    ...mapState("media", {
      mediaTime: "time",
      mediaDuration: "duration",
    }),
    ...mapState("waveform", {
      waveformData: "data",
      waveformRange: "range",
      waveformOffset: "offset",
    }),
    playheadPosition() {
      return Math.round(this.getPositionAt(this.mediaTime));
    },
    playheadStyle() {
      return {
        borderRight: `${this.playheadWidth}px solid ${this.playheadColor}`,
        left: `${this.playheadPosition - this.playheadWidth / 2}px`,
      };
    },
    resampledData() {
      if (this.waveformData && this.width > 0) {
        const width = Math.min(this.width, this.waveformData.length);
        return this.waveformData.resample({ width });
      }

      return null;
    },
  },
  watch: {
    height() {
      this.$nextTick(function () {
        this.drawWave();
        this.drawAxis();
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
          this.setOffset(this.offset + x - 10);
          return this;
        }
      }
    },
    resampledData(value) {
      this.$nextTick(function () {
        if (value) {
          this.setWaveformScale(this.resampledData.scale);
          this.setWaveformMinScale(this.waveformData.scale);
          this.setWaveformMaxScale(this.resampledData.scale);
        }

        this.setOffset(0);
        this.drawWave();
        this.drawAxis();
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
    }
  },
  methods: {
    ...mapActions("media", {
      seekMediaTo: "seekTo",
    }),
    ...mapMutations("waveform", {
      setWaveformScale: "setScale",
      setWaveformMinScale: "setMinScale",
      setWaveformMaxScale: "setMaxScale",
      setWaveformOffset: "setOffset",
    }),

    /**
     * Update the wave layer
     */
    drawWave() {
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
          const endX = Math.max(startX + this.width, this.resampledData.length);

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
    },

    /**
     * Update the axis layer.
     */
    drawAxis() {
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
      if (this.resampledData) {
        const min = this.waveformData.scale;
        const max = this.maxScale;

        let clamped = parseInt(scale, 10);
        clamped = Math.min(Math.max(scale, min), max);

        if (clamped !== this.resampledData.scale) {
          this.resampledData = this.waveformData.resample({ scale: clamped });

          const offset =
            this.resampledData.at_time(this.mediaTime) - this.width / 2;
          this.setOffset(offset, true);
        }
      }
    },

    /**
     * Set the current wave's offset
     * @param {Number} offset The wave's offset left position
     * @param {Boolean} forceRedraw Whether to force layers update
     */
    setOffset(offset, forceRedraw) {
      if (this.resampledData && this.width > 0) {
        let new_offset = offset;

        new_offset = Math.min(
          this.resampledData.length - this.width,
          new_offset
        );
        new_offset = Math.max(0, new_offset);
        new_offset = Math.round(new_offset);

        if (forceRedraw || new_offset !== this.offset) {
          this.offset = new_offset;

          this.drawWave();
          this.drawAxis();

          this.setWaveformOffset({
            start: this.getTimeAt(0),
            end: this.getTimeAt(this.width),
          });
        }
      }
    },

    /**
     * Update the offset in order to put the playhead's position at the center
     * @param {Number} time The time in seconds to center to
     */
    centerToTime(time) {
      if (this.resampledData && this.width > 0) {
        const offset = this.resampledData.at_time(time) - this.width / 2;
        this.setOffset(offset, false);
      }
    },

    /**
     * Get the time in seconds corresponding to an x position in pixels
     * @param {Number} x The x position
     * @return {Number} The corresponding time in seconds
     */
    getTimeAt(x) {
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

      this.setOffset(this.offset + this._mousedown_x - evt.clientX);
      this.mousedownX = evt.clientX;
    },

    /**
     * The mousewheel event handler
     * @param {Event} evt The event object
     */
    onMouseWheel(evt) {
      const delta = Math.max(-1, Math.min(1, evt.wheelDelta || -evt.detail));

      if (delta > 0) {
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
