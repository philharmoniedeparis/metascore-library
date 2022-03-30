<template>
  <div
    v-show="active && !hidden"
    :id="component.id"
    :class="[
      'metaScore-component',
      paramCase(component.type),
      { active, hidden },
    ]"
    :style="{
      ...position,
      ...size,
      transform,
    }"
  >
    <div
      class="metaScore-component--inner"
      :style="{
        ...background,
        ...border,
        opacity,
      }"
    >
      <slot />
    </div>

    <slot name="outer"></slot>
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
    active: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["activated", "deactivated"],
  setup(props) {
    const store = useStore();
    const component = toRef(props, "component");
    const model = store.getModel(component.value.type);
    const defaultActive = toRef(props, "active");

    return {
      ...useBackground(component, model),
      ...useBorder(component, model),
      ...useHidden(component, model),
      ...useOpacity(component, model),
      ...usePosition(component, model),
      ...useSize(component, model),
      ...useTime(component, model, defaultActive),
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
  transform-style: preserve-3d;

  .metaScore-component--inner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    min-width: 1px;
    min-height: 1px;
    box-sizing: border-box;
    overflow: hidden;
  }
}
</style>
