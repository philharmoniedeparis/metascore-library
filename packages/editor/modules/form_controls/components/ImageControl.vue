<template>
  <form-group
    :class="['control', 'image', { readonly, disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <input
      :id="inputId"
      v-model="value"
      :readonly="readonly"
      :disabled="disabled"
      @focus="onInputFocus"
      @blur="onInputBlur"
      @change="onInputChange"
    />
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
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: "",
    },
    lazy: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "blur", "focus"],
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
        if (!this.lazy) {
          this.$emit("update:modelValue", value);
        }
      },
    },
  },
  methods: {
    onInputFocus() {
      this.$emit("focus");
    },
    onInputBlur() {
      this.$emit("blur");
    },
    onInputChange(evt) {
      if (this.lazy) {
        this.$emit("update:modelValue", evt.target.value);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  &.disabled {
    input {
      opacity: 0.5;
    }
  }
}
</style>
