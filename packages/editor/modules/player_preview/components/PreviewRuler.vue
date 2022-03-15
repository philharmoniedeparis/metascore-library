<template>
  <div class="preview-ruler" :data-axis="axis">
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          :id="patternId"
          x="0"
          y="0"
          :width="vertical ? majorTickLength : adjustedMajorTickStep * zoom"
          :height="vertical ? adjustedMajorTickStep * zoom : majorTickLength"
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="0"
            y="0"
            :width="vertical ? majorTickLength : tickWidth"
            :height="vertical ? tickWidth : majorTickLength"
            fill="currentColor"
          />
          <rect
            v-for="n in adjustedMajorTickStep / adjustedMinorTickStep"
            :key="n"
            :x="
              vertical
                ? majorTickLength - minorTickLength
                : n * (adjustedMinorTickStep * zoom)
            "
            :y="
              vertical
                ? n * (adjustedMinorTickStep * zoom)
                : majorTickLength - minorTickLength
            "
            :width="vertical ? minorTickLength : tickWidth"
            :height="vertical ? tickWidth : minorTickLength"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <g>
        <rect
          :fill="`url(#${patternId})`"
          :width="vertical ? majorTickLength : '100%'"
          :height="vertical ? '100%' : majorTickLength"
        />
        <text
          v-for="(n, i) in majorTicksCount"
          :key="n"
          :x="
            (vertical ? -1 : 1) *
            ((i * adjustedMajorTickStep + adjustedMinorTickStep) * zoom)
          "
          y="0"
          :text-anchor="vertical ? 'end' : 'start'"
          :transform="vertical ? 'rotate(270)' : null"
          fill="currentColor"
          dominant-baseline="hanging"
        >
          {{ i * adjustedMajorTickStep }}
        </text>
        <rect
          v-show="tracking"
          class="tracker"
          :x="vertical ? 0 : trackerPosition"
          :y="vertical ? trackerPosition : 0"
          :width="vertical ? majorTickLength : trackerWidth"
          :height="vertical ? trackerWidth : majorTickLength"
        />
      </g>
    </svg>
  </div>
</template>

<script>
import { debounce, ceil } from "lodash";
import { v4 as uuid } from "uuid";
import { useStore } from "@metascore-library/core/services/module-manager";

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
    trackerWidth: {
      type: Number,
      default: 1,
    },
  },
  setup() {
    const store = useStore("player-preview");
    return { store };
  },
  data() {
    return {
      majorTicksCount: 0,
      tracking: false,
      trackerPosition: 0,
      patternId: `ruler-${uuid()}`,
    };
  },
  computed: {
    vertical() {
      return this.axis === "y";
    },
    zoom() {
      return this.store.zoom;
    },
    adjustedMinorTickStep() {
      let step = this.minorTickStep;

      while (step * this.zoom < this.minMinorTickSpacing) {
        step += this.minorTickStep;
      }

      return step;
    },
    adjustedMajorTickStep() {
      let step = this.majorTickStep;

      while (step * this.zoom < this.minMajorTickSpacing) {
        step += this.majorTickStep;
      }

      return step;
    },
  },
  watch: {
    trackTarget(value, previous) {
      if (previous) {
        this.destroyTracker(previous);
      }

      this.setupTracker();
    },
  },
  mounted() {
    this._resize_observer = new ResizeObserver(
      debounce(this.updateTicksCount.bind(this), 500)
    );
    this._resize_observer.observe(this.$el);

    this.setupTracker();

    this.updateTicksCount();
  },
  beforeUnmount() {
    if (this._resize_observer) {
      this._resize_observer.disconnect();
      delete this._resize_observer;
    }

    this.destroyTracker(this.trackTarget);
  },
  methods: {
    updateTicksCount() {
      this.majorTicksCount = ceil(
        (this.vertical ? this.$el.clientHeight : this.$el.clientWidth) /
          (this.adjustedMajorTickStep * this.zoom)
      );
    },
    setupTracker() {
      if (this.trackTarget) {
        this.trackTarget.addEventListener(
          "mouseover",
          this.onTrackTargetMouseover,
          true
        );
        this.trackTarget.addEventListener(
          "mousemove",
          this.onTrackTargetMousemove,
          true
        );
        this.trackTarget.addEventListener(
          "mouseout",
          this.onTrackTargetMouseout,
          true
        );
      }
    },
    destroyTracker(target) {
      if (target) {
        target.removeEventListener(
          "mouseover",
          this.onTrackTargetMouseover,
          true
        );
        target.removeEventListener(
          "mousemove",
          this.onTrackTargetMousemove,
          true
        );
        target.removeEventListener(
          "mouseout",
          this.onTrackTargetMouseout,
          true
        );
      }
    },
    onTrackTargetMouseover() {
      this.tracking = true;
    },
    onTrackTargetMousemove(evt) {
      this.trackerPosition = this.vertical ? evt.clientY : evt.clientX;
    },
    onTrackTargetMouseout() {
      this.tracking = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.preview-ruler {
  ::v-deep(svg) {
    width: 100%;
    height: 100%;
    user-select: none;

    text {
      font-size: 0.9em;
      opacity: 0.75;
    }
  }
}
</style>
