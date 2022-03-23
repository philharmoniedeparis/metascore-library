<template>
  <div
    :id="component.id"
    :class="[
      'metaScore-component',
      paramCase(component.type),
      { active, hidden },
    ]"
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
import { paramCase } from "param-case";
import useStore from "../store";
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
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  emits: ["activated", "deactivated"],
  setup(props) {
    const store = useStore();
    const component = toRef(props, "component");
    const model = store.getModel(component.value.type);

    return {
      ...useBackground(component, model),
      ...useBorder(component, model),
      ...useHidden(component, model),
      ...useOpacity(component, model),
      ...usePosition(component, model),
      ...useSize(component, model),
      ...useTime(component, model),
      ...useTransform(component, model),
    };
  },
  watch: {
    active(value) {
      this.$emit(value ? "activated" : "deactivated", this.component);
    },
  },
  methods: {
    paramCase,
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
