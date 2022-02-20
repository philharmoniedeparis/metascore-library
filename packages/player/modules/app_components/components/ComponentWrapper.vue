<template>
  <div
    :id="model.id"
    :class="['metaScore-component', { active, hidden }]"
    :style="{
      ...background,
      ...border,
      opacity,
      ...position,
      ...size,
      transform,
    }"
  >
    <slot />
  </div>
</template>

<script>
import { toRef } from "vue";
import useBackground from "../composables/useBackground";
import useBorder from "../composables/useBorder";
import useHidden from "../composables/useHidden";
import useOpacity from "../composables/useOpacity";
import usePosition from "../composables/usePosition";
import useSize from "../composables/useSize";
import useTime from "../composables/useTime";
import useTransform from "../composables/useTransform";

export default {
  props: {
    /**
     * The associated component model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  emits: ["activated", "deactivated"],
  setup(props) {
    const model = toRef(props, "model");
    return {
      ...useBackground(model),
      ...useBorder(model),
      ...useHidden(model),
      ...useOpacity(model),
      ...usePosition(model),
      ...useSize(model),
      ...useTime(model),
      ...useTransform(model),
    };
  },
  watch: {
    active(value) {
      this.$emit(value ? "activated" : "deactivated", this, this.model);
    },
  },
};
</script>

<style lang="scss" scoped>
.metaScore-component {
  position: absolute;
  min-width: 1px;
  min-height: 1px;
  transform-style: preserve-3d;
  overflow: hidden;

  &:not(.active),
  &.hidden {
    display: none;
  }
}
</style>
