<template>
  <form-group
    class="control"
    type="time"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <timecode-input :id="inputId" v-model="value" />
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";

export default {
  props: {
    label: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    modelValue: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      inputId: uuid(),
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  ::v-deep(input) {
    padding: 0.3125em;
    color: $white;
    background: $mediumgray;
    border: 1px solid $mediumgray;
    border-radius: 0.25em;
    box-sizing: border-box;

    &:focus,
    &:active,
    &:focus-visible {
      outline: 1px solid $lightgray;
      border-color: $lightgray;
    }
  }
}
</style>
