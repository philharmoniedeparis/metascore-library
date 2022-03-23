<template>
  <div class="cursor-keyframes-editor" @click.stop="onClick">
    <div
      v-for="(keyframe, index) in value"
      :key="index"
      class="keyframe"
      :style="{ left: `${keyframe[1]}px` }"
    ></div>
  </div>
</template>

<script>
import { round } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";

export default {
  props: {
    modelValue: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const mediaStore = useModule("media").useStore();
    return { mediaStore };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        if (!this.lazy) {
          this.$emit("update:modelValue", value);
        }
      },
    },
    mediaTime() {
      return this.mediaStore.time;
    },
  },
  methods: {
    onClick(evt) {
      const { x } = this.$el.getBoundingClientRect();
      const { clientX } = evt;

      this.addKeyframe(this.mediaTime, clientX - x);
    },
    addKeyframe(time, position) {
      this.value.push([round(time, 2), Math.round(position)]);
      this.value = this.value.sort((a, b) => {
        return a.position - b.position;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.cursor-keyframes-editor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  .keyframe {
    position: absolute;
    top: 0;
    height: 100%;
    width: 1px;
    background: $metascore-color;
  }
}
</style>
