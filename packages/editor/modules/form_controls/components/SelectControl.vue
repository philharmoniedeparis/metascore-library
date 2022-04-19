<template>
  <form-group
    :class="['control', 'select', { multiple, disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <select
      :id="inputId"
      ref="input"
      v-model="value"
      v-autofocus="autofocus"
      :multiple="multiple"
      :disabled="disabled"
    >
      <option
        v-for="option in normalizedOptions"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
        @mousedown="onOptionMousedown"
      >
        {{ option.label }}
      </option>
    </select>

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
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
    multiple: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: [String, Number, Array],
      default: null,
    },
    optionLabel: {
      type: Function,
      default: (o) => {
        return o.label;
      },
    },
    optionKey: {
      type: Function,
      default: (o) => {
        return o.value;
      },
    },
    optionValue: {
      type: Function,
      default: (o) => {
        return o.value;
      },
    },
    optionDisabled: {
      type: Function,
      default: (o) => {
        return o.disabled;
      },
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
      return this.options.map((option) => {
        return isObject(option)
          ? {
              label: this.optionLabel(option),
              value: this.optionKey(option),
              disabled: this.optionDisabled(option),
            }
          : { label: option, value: option };
      });
    },
    value: {
      get() {
        if (this.multiple) {
          return this.modelValue?.map((v) => {
            return isObject(v) ? this.optionKey(v) : v;
          });
        }
        return isObject(this.modelValue)
          ? this.optionKey(this.modelValue)
          : this.modelValue;
      },
      set(value) {
        if (this.multiple) {
          const options = this.options.filter((o) => {
            return value.includes(isObject(o) ? this.optionKey(o) : o);
          });
          this.$emit("update:modelValue", options.map(this.optionValue));
        }

        const option = this.options.find((o) => {
          return value === (isObject(o) ? this.optionKey(o) : o);
        });
        this.$emit("update:modelValue", this.optionValue(option));
      },
    },
  },
  methods: {
    onOptionMousedown(evt) {
      if (!this.multiple) {
        return;
      }

      evt.target.selected = !evt.target.selected;
      this.$refs.input.dispatchEvent(new Event("change"));
      evt.preventDefault();
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

  &.multiple {
    ::v-deep(label) {
      align-self: flex-start;
    }
  }

  &.disabled {
    select {
      opacity: 0.5;
    }
  }
}
</style>
