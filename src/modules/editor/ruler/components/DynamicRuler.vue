<template>
  <div class="dynamic-ruler" :style="style">
    <svg xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect
          v-for="(n, i) in minorTicks"
          :key="n"
          :x="i * minorTickStep"
          :y="majorTickLength - minorTickLength"
          :width="tickWidth"
          :height="minorTickLength"
        />
        <rect
          v-for="(n, i) in majorTicks"
          :key="n"
          :x="i * majorTickStep"
          y="0"
          :width="tickWidth"
          :height="majorTickLength"
        />
        <text
          v-for="(n, i) in majorTicks"
          :key="n"
          :x="i * majorTickStep + minorTickStep"
          y="0"
          text-anchor="start"
        >
          {{ i * majorTickStep }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script>
import { debounce, round } from "lodash";

export default {
  props: {
    axis: {
      type: String,
      default: "x",
      validator(value) {
        return ["x", "y"].includes(value);
      },
    },
    tickWidth: {
      type: Number,
      default: 1,
    },
    minorTickLength: {
      type: Number,
      default: 5,
    },
    minorTickStep: {
      type: Number,
      default: 5,
    },
    minMinorTickSpacing: {
      type: Number,
      default: 5,
    },
    majorTickLength: {
      type: Number,
      default: 18,
    },
    majorTickStep: {
      type: Number,
      default: 50,
    },
    minMajorTickSpacing: {
      type: Number,
      default: 50,
    },
    trackTarget: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      minorTicks: 0,
      majorTicks: 0,
    };
  },
  computed: {
    style() {
      return {
        [this.axis === "y" ? "width" : "height"]: `${this.majorTickLength}px`,
      };
    },
  },
  mounted() {
    this._observer = new ResizeObserver(
      debounce(this.updateTicks.bind(this), 500)
    );
    this._observer.observe(this.$el);

    this.updateTicks();
  },
  beforeUnmount() {
    if (this._observer) {
      this._observer.disconnect();
    }
  },
  methods: {
    updateTicks() {
      this.minorTicks = round(
        (this.axis === "y" ? this.$el.clientHeight : this.$el.clientWidth) /
          this.minorTickStep
      );
      this.majorTicks = round(
        (this.axis === "y" ? this.$el.clientHeight : this.$el.clientWidth) /
          this.majorTickStep
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../../assets/css/theme.scss";

.dynamic-ruler {
  background: $mediumgray;

  ::v-deep(svg) {
    width: 100%;
    dominant-baseline: hanging;
    user-select: none;

    rect {
      fill: $white;
    }
    text {
      fill: $white;
    }
  }
}
</style>
