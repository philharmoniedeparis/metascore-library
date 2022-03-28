<template>
  <form-group
    :class="['control', 'select', { disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <select :id="inputId" v-model="value" :disabled="disabled">
      <option v-for="(v, l) in options" :key="v" :value="v">
        {{ l }}
      </option>
    </select>
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
    disabled: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: [String, Number],
      default: null,
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
  select {
    display: inline-block;
    font-family: inherit;
    width: auto;
    max-width: 100%;
    margin: 0;

    option {
      font-weight: normal;
      background: $mediumgray;
    }
  }

  &.disabled {
    select {
      opacity: 0.5;
    }
  }
}
</style>
