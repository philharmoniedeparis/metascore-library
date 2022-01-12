<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="cursor">
    <canvas ref="canvas" @click.prevent="onClick" />
  </component-wrapper>
</template>

<script>
import "../../../../../polyfills/GeomertyUtils";
import { mapState } from "vuex";
import { map, radians } from "../../../../utils/math";

export default {
  inject: ["seekMediaTo"],
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState("media", {
      mediaReady: "ready",
      mediaTime: "time",
      mediaDuration: "duration",
    }),
    canvas() {
      return this.$refs.canvas;
    },
    context() {
      return this.canvas.getContext("2d");
    },
    startTime() {
      return this.model["start-time"] ?? 0;
    },
    endTime() {
      return this.model["end-time"] ?? this.mediaDuration;
    },
    dimension() {
      return this.model.dimension;
    },
    borderWidth() {
      return this.model["border-width"];
    },
    form() {
      return this.model["cursor-form"];
    },
    direction() {
      return this.model["cursor-direction"];
    },
    cursorWidth() {
      return this.model["cursor-width"];
    },
    cursorColor() {
      return this.model["cursor-color"];
    },
    keyframes() {
      return this.model["cursor-keyframes"];
    },
    acceleration() {
      return this.keyframes ? 1 : this.model["cursor-acceleration"];
    },
    loopDuration() {
      return (
        this.model["cursor-loop-duration"] ?? this.endTime - this.startTime
      );
    },
    startAngle() {
      return radians(this.model["cursor-start-angle"]);
    },
  },
  watch: {
    mediaReady() {
      this.update();
    },
    mediaTime() {
      this.update();
    },
    model: {
      handler() {
        this.update();
      },
      deep: true,
    },
    "model.dimension"() {
      this.updateSize();
    },
    "model.border-width"() {
      this.updateSize();
    },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.updateSize);
    this.resizeObserver.observe(this.canvas);

    this.update();
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      delete this.resizeObserver;
    }
  },
  methods: {
    update() {
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
          if (reversed) {
            if (keyframe.time <= time && keyframe.position <= startPosition) {
              startPosition = keyframe.position;
              startTime = keyframe.time;
            }

            if (keyframe.time >= time && keyframe.position >= endPosition) {
              endPosition = keyframe.position;
              endTime = keyframe.time;
            }
          } else {
            if (keyframe.time <= time && keyframe.position >= startPosition) {
              startPosition = keyframe.position;
              startTime = keyframe.time;
            }

            if (keyframe.time >= time && keyframe.position <= endPosition) {
              endPosition = keyframe.position;
              endTime = keyframe.time;
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
      angle -= this.startAngle;
      angle -= Math.PI / 2; // Adjust the angle so that 0 start at top

      let time = map(angle, 0, Math.PI * 2, 0, this.loopDuration);
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
          if (reversed) {
            if (keyframe.position <= pos && keyframe.time <= startTime) {
              startPosition = keyframe.position;
              startTime = keyframe.time;
            }

            if (keyframe.position >= pos && keyframe.time >= endTime) {
              endPosition = keyframe.position;
              endTime = keyframe.time;
            }
          } else {
            if (keyframe.position <= pos && keyframe.time >= startTime) {
              startPosition = keyframe.position;
              startTime = keyframe.time;
            }

            if (keyframe.position >= pos && keyframe.time <= endTime) {
              endPosition = keyframe.position;
              endTime = keyframe.time;
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
};
</script>

<style lang="scss" scoped>
.cursor {
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
