<i18n>
{
}
</i18n>

<template>
  <div
    v-show="active && !hidden"
    :id="model.id"
    :class="['metaScore-component', { active, hidden }]"
    :style="{ ...position, ...size }"
  >
    <div
      class="metaScore-component--inner"
      :style="{ ...background, ...border }"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import { toRef } from "vue";
import useHidden from "../composables/useHidden";
import useBorder from "../composables/useBorder";
import useBackground from "../composables/useBackground";
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
  setup(props) {
    const model = toRef(props, "model");
    return {
      ...useHidden(model),
      ...useBackground(model),
      ...useBorder(model),
      ...usePosition(model),
      ...useSize(model),
      ...useTime(model),
    };
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
}
</style>
