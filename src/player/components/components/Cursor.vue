<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="cursor">
    <canvas ref="canvas" @click.prevent="_onClick" />
  </component-wrapper>
</template>

<script>
import "../../../../polyfills/GeomertyUtils";
import { mapState } from "vuex";
import ComponentWrapper from "../ComponentWrapper.vue";
import { map, radians } from "../../../core/utils/Math";

// @TODO: update on resize

export default {
  components: {
    ComponentWrapper,
  },
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
      return this.model.form;
    },
    direction() {
      return this.model.direction;
    },
    cursorWidth() {
      return this.model["cursor-width"];
    },
    cursorColor() {
      return this.model["cursor-color"];
    },
    keyframes() {
      return this.model.keyframes;
    },
    acceleration() {
      return this.model.keyframes ? 1 : this.model.acceleration;
    },
    loopDuration() {
      return this.model["loop-duration"] ?? this.endTime - this.startTime;
    },
    startAngle() {
      return radians(this.model["start-angle"]);
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
  },
  mounted() {
    this.update();
  },
  methods: {
    update() {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      switch (this.form) {
        case "circular":
          this._drawCircularCursor();
          break;

        default:
          this._drawLinearCursor();
          break;
      }
    },

    /**
     * Draw a linear cursor
     * @private
     */
    _drawLinearCursor() {
      const pos = this._getLinearPositionFromTime(this.mediaTime);
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
     * @private
     * @param {Number} time The media time in seconds
     * @returns {Object} The x and y position
     */
    _getLinearPositionFromTime(time) {
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
     * @private
     */
    _drawCircularCursor() {
      const width = this.canvas.width;
      const height = this.canvas.height;

      const angle = this._getCircularAngleFromTime(this.mediaTime);

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
     * @private
     * @param {Number} time The media time in seconds
     * @returns {Number} The angle in radians
     */
    _getCircularAngleFromTime(time) {
      let angle = this.startAngle;
      angle += Math.PI / 2; // Adjust the angle so that 0 start at top
      angle +=
        map(time - this.startTime, 0, this.loopDuration, 0, Math.PI * 2) *
        (this.direction === "ccw" ? -1 : 1);

      return angle;
    },

    _onClick(evt) {
      switch (this.form) {
        case "circular":
          {
            const pos = this._getLinearPositionFromMouseEvent(evt);
            const angle = this._getCircularAngleFromMousePos(pos.x, pos.y);
            const time = this._getTimeFromCircularAngle(angle);
            this.seekMediaTo(time);
          }
          break;

        default:
          {
            const pos = this._getLinearPositionFromMouseEvent(evt);
            const time = this._getTimeFromLinearPosition(pos.x, pos.y);
            this.seekMediaTo(time);
          }
          break;
      }
    },

    /**
     * Get a position on a linear cursor corresponding to a mouse position
     * @private
     * @param {Event} evt The mouse click event
     * @returns {Object} The x and y position
     */
    _getLinearPositionFromMouseEvent(evt) {
      return window.convertPointFromPageToNode(
        this.canvas,
        evt.clientX,
        evt.clientY
      );
    },

    /**
     * Get an angle on a circular cursor corresponding to a mouse position
     * @private
     * @param {Event} evt The mouse click event
     * @returns {Number} The angle in radians
     */
    _getCircularAngleFromMousePos(x, y) {
      x -= this.canvas.width / 2;
      x *= this.direction === "ccw" ? -1 : 1;

      y -= this.canvas.height / 2;

      return Math.atan2(y, x) + Math.PI;
    },

    /**
     * Helper function to get the media time corresponding to an angle in a circular cursor
     *
     * @private
     * @param {Number} angle The angle in radians
     * @returns {Number} The corresponding media time
     */
    _getTimeFromCircularAngle(angle) {
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
     * @private
     * @param {Number} x The position on the horizontal axis
     * @param {Number} y The position on the vertical axis
     * @returns {Number} The corresponding media time
     */
    _getTimeFromLinearPosition(x, y) {
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
