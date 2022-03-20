<template>
  <form-group
    :class="['control', 'time', { readonly, disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <timecode-input
      :id="inputId"
      v-model="value"
      :readonly="readonly"
      :disabled="disabled"
      :min="min"
      :max="max"
      :in-button="inButton"
      :out-button="outButton"
      :clear-button="clearButton"
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
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: null,
    },
    inButton: {
      type: Boolean,
      default: false,
    },
    outButton: {
      type: Boolean,
      default: false,
    },
    clearButton: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    lazy: {
      type: Boolean,
      default: false,
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
        if (!this.lazy) {
          this.$emit("update:modelValue", value);
        }
      },
    },
  },
  methods: {
    onInputChange(evt) {
      if (this.lazy) {
        this.$emit("update:modelValue", evt.target.value);
      }
    },
  },
};
</script>
