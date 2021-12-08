<i18n>
{
}
</i18n>

<template>
  <div
    :id="model.id"
    :class="['metaScore-component', { active, hidden }]"
    :style="{ ...position, ...size }"
  >
    <div
      class="metaScore-component--inner"
      :style="{ ...background, ...border, opacity }"
    >
      <slot />
    </div>
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

export default {
  props: {
    /**
     * The associated vuex-orm model
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
    };
  },
  watch: {
    active: {
      handler(active) {
        this.$emit(active ? "activated" : "deactivated", this, this.model);
      },
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

  > .metaScore-component--inner {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &:not(.active),
  &.hidden {
    display: none;
  }
}
</style>
