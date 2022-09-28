<i18n>
{
  "fr": {
    "loading_message": "Chargement ...",
    "error_message": "Aucune donnée de forme d'onde disponible",
  },
  "en": {
    "loading_message": "Loading...",
    "error_message": "No waveform data available",
  },
}
</i18n>

<template>
  <div class="waveform--zoom">
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
import { debounce } from "lodash";
import { clamp } from "@metascore-library/core/utils/math";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "../store";

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
    const store = useStore();
    const {
      duration: mediaDuration,
      time: mediaTime,
      seekTo: seekMediaTo,
      formatTime,
    } = useModule("media_player");
    return { store, mediaDuration, mediaTime, seekMediaTo, formatTime };
  },
  data() {
    return {
      width: 0,
      height: 0,
      resampledData: null,
      offsetX: 0,
      mousedownX: null,
      dragging: false,
    };
  },
  computed: {
    waveformData() {
      return this.store.data;
    },
    waveformRange() {
      return this.store.range;
    },
    waveformScale() {
      return this.store.scale;
    },
    waveformMinScale() {
      return this.store.minScale;
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
    message() {
      if (this.store.loading) {
        return this.$t("loading_message");
      }
      if (this.store.error) {
        return this.$t("error_message");
      }
      return null;
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
      });
    },
    waveformData(value) {
      this.$nextTick(function () {
        this.store.minScale = value?.scale;
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
            this.resampledData.length > this.offsetX + this.width)
        ) {
          this.setOffsetX(this.offsetX + x - 10);
        }
      }
    },
    resampledData(value) {
      this.store.scale = value?.scale;
      this.setOffsetX(0);

      this.store.offset = {
        start: this.getTimeAt(0),
        end: this.getTimeAt(this.width),
      };

      this.$nextTick(function () {
        this.drawWave();
        this.drawAxis();
      });
    },
    offsetX() {
      this.store.offset = {
        start: this.getTimeAt(0),
        end: this.getTimeAt(this.width),
      };

      this.$nextTick(function () {
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
      delete this._resize_observer;
    }
  },
  methods: {
    resampleData() {
      if (this.waveformData && this.width) {
        if (
          this.resampledData &&
          this.waveformScale !== null &&
          this.resampledData.scale !== this.waveformScale
        ) {
          this.resampledData = this.waveformData.resample({
            scale: this.waveformScale,
          });
          return;
        }

        this.resampledData = this.waveformData.resample({
          width: this.width,
        });
        this.store.maxScale = this.resampledData.scale;
      }
    },

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
          const startX = this.offsetX;
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
    },

    /**
     * Update the axis layer.
     */
    drawAxis() {
      if (this.width && this.height) {
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
            const text = this.formatTime(time);

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
     * Set the current scale
     * @param {Number} value The scale to set
     */
    setScale(value) {
      if (this.resampledData && this.width) {
        this.store.scale = Math.min(
          Math.max(parseInt(value, 10), this.waveformMinScale),
          this.waveformMaxScale
        );
      }
    },

    setOffsetX(value) {
      this.offsetX = clamp(value, 0, this.resampledData.length - this.width);
    },

    /**
     * Update the offset in order to put the playhead's position at the center
     * @param {Number} time The time in seconds to center to
     */
    centerToTime(time) {
      if (this.resampledData && this.width) {
        this.setOffsetX(this.resampledData.at_time(time) - this.width / 2);
      }
    },

    /**
     * Get the time in seconds corresponding to an x position in pixels
     * @param {Number} x The x position
     * @return {Number} The corresponding time in seconds
     */
    getTimeAt(x) {
      if (this.resampledData) {
        return this.resampledData.time(x + this.offsetX);
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
        return this.resampledData.at_time(time) - this.offsetX;
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
     * Zoom in
     */
    zoomIn() {
      if (this.resampledData) {
        this.setScale(this.waveformScale - this.zoomStep);
      }
    },

    /**
     * Zoom out
     *
     * @return {this}
     */
    zoomOut() {
      if (this.resampledData) {
        this.setScale(this.waveformScale + this.zoomStep);
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
      this.setOffsetX(this.offsetX + this.mousedownX - evt.clientX);
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
      if (!this.dragging) {
        const { left } = evt.target.getBoundingClientRect();
        const x = evt.pageX - left;
        this.seekMediaTo(this.getTimeAt(x));
      } else {
        this.dragging = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.waveform--zoom {
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
