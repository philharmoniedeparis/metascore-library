<template>
  <form-group
    :class="['control', 'select', { disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <select
      :id="inputId"
      v-model="value"
      v-autofocus="autofocus"
      :disabled="disabled"
    >
      <option
        v-for="option in normalizedOptions"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import { isObject } from "lodash";

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
    autofocus: {
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
    normalizedOptions() {
      return Object.entries(this.options).map(([label, option]) => {
        if (isObject(option) && "value" in option) {
          return { label, ...option };
        }
        return { label, value: option };
      });
    },
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
