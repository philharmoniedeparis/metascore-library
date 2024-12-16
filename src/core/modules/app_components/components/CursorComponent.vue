<template>
  <component-wrapper :component="component" :hide-when-inactive="false" @click="onClick">
    <canvas ref="canvas" />
  </component-wrapper>
</template>

<script lang="ts">
import { defineComponent, toRef } from "vue";
import useStore from "../store";
import { useModule } from "@core/services/module-manager";
import useTime from "../composables/useTime";
import "../../../polyfills/GeomertyUtils";
import { map, radians } from "@core/utils/math";
import type MediaPlayerModule from "../../media_player";

export default defineComponent ({
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const component = toRef(props, "component");
    const model = store.getModelByType(component.value.type);

    const {
      ready: mediaReady,
      time: mediaTime,
      duration: mediaDuration,
      seekTo: seekMediaTo,
    } = useModule("media_player") as MediaPlayerModule;
    return {
      mediaReady,
      mediaTime,
      mediaDuration,
      seekMediaTo,
      ...useTime(component, model),
    };
  },
  computed: {
    canvas() {
      return this.$refs.canvas;
    },
    context() {
      return this.canvas.getContext("2d");
    },
    startTime() {
      return this.component["start-time"] ?? 0;
    },
    endTime() {
      return this.component["end-time"] ?? this.mediaDuration;
    },
    dimension() {
      return this.component.dimension;
    },
    borderWidth() {
      return this.component["border-width"];
    },
    form() {
      return this.component.form;
    },
    direction() {
      return this.component.direction;
    },
    cursorWidth() {
      return this.component["cursor-width"];
    },
    cursorColor() {
      return this.component["cursor-color"];
    },
    keyframes() {
      return this.component.keyframes;
    },
    acceleration() {
      return this.keyframes?.length ? 1 : this.component.acceleration;
    },
    loopDuration() {
      return this.component["loop-duration"] ?? this.endTime - this.startTime;
    },
    startAngle() {
      return radians(this.component["start-angle"]);
    },
  },
  watch: {
    mediaReady() {
      this.update();
    },
    mediaTime() {
      this.update();
    },
    component: {
      handler() {
        this.update();
      },
      deep: true,
    },
    "component.dimension"() {
      this.updateSize();
    },
    "component.border-width"() {
      this.updateSize();
    },
  },
  mounted() {
    this._resize_observer = new ResizeObserver(this.updateSize);
    this._resize_observer.observe(this.canvas);

    this.update();
  },
  beforeUnmount() {
    if (this._resize_observer) {
      this._resize_observer.disconnect();
      delete this._resize_observer;
    }
  },
  methods: {
    update() {
      if (!this.active) return;

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      switch (this.form) {
        case "circular":
          this.drawCircularCursor();
          break;

        default:
          this.drawLinearCursor();
          break;
      }
    },

    updateSize() {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;

      this.update();
    },

    /**
     * Draw a linear cursor
     */
    drawLinearCursor() {
      const pos = this.getLinearPositionFromTime(this.mediaTime);
      const vertical = this.direction === "bottom" || this.direction === "top";
      const width = vertical ? this.canvas.width : this.cursorWidth;
      const height = vertical ? this.cursorWidth : this.canvas.height;

      switch (this.direction) {
        case "top":
          pos.y -= this.cursorWidth;
          break;

        case "left":
          pos.x -= this.cursorWidth;
          break;
      }

      // Draw the cursor line.
      this.context.save();
      this.context.beginPath();
      this.context.rect(pos.x, pos.y, width, height);
      this.context.fillStyle = this.cursorColor;
      this.context.fill();
      this.context.closePath();
      this.context.restore();
    },

    /**
     * Get a position on a linear cursor corresponding to a media time
     * @param {Number} time The media time in seconds
     * @returns {Object} The x and y position
     */
    getLinearPositionFromTime(time) {
      const reversed = this.direction === "left" || this.direction === "top";
      let startTime = this.startTime;
      let endTime = this.endTime;

      let startPosition = 0;
      let endPosition =
        this.direction === "top" || this.direction === "bottom"
          ? this.canvas.height
          : this.canvas.width;
      const pos = { x: 0, y: 0 };

      if (reversed) {
        startPosition = endPosition;
        endPosition = 0;
      }

      if (this.keyframes) {
        // Calculate position from keyframes
        this.keyframes.forEach((keyframe) => {
          const [keyframe_time, keyframe_position] = keyframe;

          if (reversed) {
            if (keyframe_time <= time && keyframe_position <= startPosition) {
              startPosition = keyframe_position;
              startTime = keyframe_time;
            }

            if (keyframe_time >= time && keyframe_position >= endPosition) {
              endPosition = keyframe_position;
              endTime = keyframe_time;
            }
          } else {
            if (keyframe_time <= time && keyframe_position >= startPosition) {
              startPosition = keyframe_position;
              startTime = keyframe_time;
            }

            if (keyframe_time >= time && keyframe_position <= endPosition) {
              endPosition = keyframe_position;
              endTime = keyframe_time;
            }
          }
        });
      }

      // Calculate position
      switch (this.direction) {
        case "top":
        case "bottom":
          pos.y = map(time, startTime, endTime, startPosition, endPosition);
          pos.y = Math.pow(pos.y, this.acceleration);
          pos.y = Math.round(pos.y);
          break;

        case "left":
        default:
          pos.x = map(time, startTime, endTime, startPosition, endPosition);
          pos.x = Math.pow(pos.x, this.acceleration);
          pos.x = Math.round(pos.x);
      }

      return pos;
    },

    /**
     * Draw a circular cursor
     */
    drawCircularCursor() {
      const width = this.canvas.width;
      const height = this.canvas.height;

      const angle = this.getCircularAngleFromTime(this.mediaTime);

      const centre = {
        x: width / 2,
        y: height / 2,
      };

      const point = {
        x: centre.x - (width / 2 + this.borderWidth) * Math.cos(angle),
        y: centre.y - (height / 2 + this.borderWidth) * Math.sin(angle),
      };

      // Draw the cursor line.
      this.context.save();
      this.context.translate(0.5, 0.5); // Translate by 0.5 px in both direction for anti-aliasing
      this.context.beginPath();
      this.context.moveTo(centre.x, centre.y);
      this.context.lineTo(point.x, point.y);
      this.context.lineCap = "round";
      this.context.lineWidth = this.cursorWidth;
      this.context.strokeStyle = this.cursorColor;
      this.context.stroke();
      this.context.closePath();
      this.context.restore();

      return this;
    },

    /**
     * Get an angle on a circular cursor corresponding to a media time
     * @param {Number} time The media time in seconds
     * @returns {Number} The angle in radians
     */
    getCircularAngleFromTime(time) {
      let angle = this.startAngle;
      angle += Math.PI / 2; // Adjust the angle so that 0 start at top
      angle +=
        map(time - this.startTime, 0, this.loopDuration, 0, Math.PI * 2) *
        (this.direction === "ccw" ? -1 : 1);

      return angle;
    },

    onClick(evt) {
      switch (this.form) {
        case "circular":
          {
            const pos = this.getLinearPositionFromMouseEvent(evt);
            const angle = this.getCircularAngleFromMousePos(pos.x, pos.y);
            const time = this.getTimeFromCircularAngle(angle);
            this.seekMediaTo(time);
          }
          break;

        default:
          {
            const pos = this.getLinearPositionFromMouseEvent(evt);
            const time = this.getTimeFromLinearPosition(pos.x, pos.y);
            this.seekMediaTo(time);
          }
          break;
      }
    },

    /**
     * Get a position on a linear cursor corresponding to a mouse position
     * @param {Event} evt The mouse click event
     * @returns {Object} The x and y position
     */
    getLinearPositionFromMouseEvent(evt) {
      return window.convertPointFromPageToNode(
        this.canvas,
        evt.clientX,
        evt.clientY
      );
    },

    /**
     * Get an angle on a circular cursor corresponding to a mouse position
     * @param {Event} evt The mouse click event
     * @returns {Number} The angle in radians
     */
    getCircularAngleFromMousePos(x, y) {
      x -= this.canvas.width / 2;
      x *= this.direction === "ccw" ? -1 : 1;

      y -= this.canvas.height / 2;

      return Math.atan2(y, x) + Math.PI;
    },

    /**
     * Helper function to get the media time corresponding to an angle in a circular cursor
     * @param {Number} angle The angle in radians
     * @returns {Number} The corresponding media time
     */
    getTimeFromCircularAngle(angle) {
      const revolution = Math.PI * 2;

      angle -= this.startAngle;
      angle -= Math.PI / 2; // Adjust the angle so that 0 start at top

      if (angle < 0) {
        angle += revolution;
      } else if (angle > revolution) {
        angle -= revolution;
      }

      let time = map(angle, 0, revolution, 0, this.loopDuration);
      time += this.startTime;

      const currentLoop = Math.floor(
        (this.mediaTime - this.startTime) / this.loopDuration
      );

      time += this.loopDuration * currentLoop;

      return time;
    },

    /**
     * Get the media time corresponding to a position on the cursor
     * @param {Number} x The position on the horizontal axis
     * @param {Number} y The position on the vertical axis
     * @returns {Number} The corresponding media time
     */
    getTimeFromLinearPosition(x, y) {
      const axis =
        this.direction === "top" || this.direction === "bottom" ? "y" : "x";
      const reversed = this.direction === "left" || this.direction === "top";
      let startTime = this.startTime;
      let endTime = this.endTime;

      let startPosition = 0;
      let endPosition = axis === "y" ? this.canvas.height : this.canvas.width;
      let pos = axis === "y" ? y : x;

      if (reversed) {
        startPosition = endPosition;
        endPosition = 0;
      }

      if (this.keyframes) {
        // Calculate position from keyframes
        this.keyframes.forEach((keyframe) => {
          const [keyframe_time, keyframe_position] = keyframe;

          if (reversed) {
            if (keyframe_position <= pos && keyframe_time <= startTime) {
              startPosition = keyframe_position;
              startTime = keyframe_time;
            }

            if (keyframe_position >= pos && keyframe_time >= endTime) {
              endPosition = keyframe_position;
              endTime = keyframe_time;
            }
          } else {
            if (keyframe_position <= pos && keyframe_time >= startTime) {
              startPosition = keyframe_position;
              startTime = keyframe_time;
            }

            if (keyframe_position >= pos && keyframe_time <= endTime) {
              endPosition = keyframe_position;
              endTime = keyframe_time;
            }
          }
        });
      } else {
        // Calculate position from acceleration
        pos = Math.pow(pos, 1 / this.acceleration);
      }

      return map(pos, startPosition, endPosition, startTime, endTime);
    },
  },
});
</script>

<style lang="scss" scoped>
.cursor {
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  &:not(.active) {
    opacity: 0;
  }
}
</style>
