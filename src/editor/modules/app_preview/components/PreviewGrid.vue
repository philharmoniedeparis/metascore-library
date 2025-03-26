<template>
  <div class="preview-grid">
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          :id="patternId"
          x="0"
          y="0"
          :width="step"
          :height="step"
          patternUnits="userSpaceOnUse"
        >
          <rect :x="step - 1" y="0" width="1" :height="step" :fill="color" />
          <rect x="0" :y="step - 1" :width="step" height="1" :fill="color" />
        </pattern>
      </defs>
      <g>
        <rect :fill="`url(#${patternId})`" width="100%" height="100%" />
      </g>
    </svg>
  </div>
</template>

<script>
import { v4 as uuid } from "uuid";

export default {
  props: {
    step: {
      type: Number,
      default: 10,
    },
    color: {
      type: String,
      default: "rgba(0, 0, 0, 0.1)",
    },
  },
  data() {
    return {
      patternId: `grid-${uuid()}`,
    };
  },
};
</script>

<style lang="scss" scoped>
.preview-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  :deep(svg) {
    width: 100%;
    height: 100%;
    user-select: none;
  }
}
</style>
