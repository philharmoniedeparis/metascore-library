<template>
  <form-group
    :class="['control', 'select', { multiple, disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
    :required="required"
  >
    <select
      :id="inputId"
      ref="input"
      v-model="value"
      v-autofocus="autofocus"
      :required="required"
      :disabled="disabled"
      :multiple="multiple"
    >
      <option
        v-for="option in normalizedOptions"
        :key="option.key"
        :value="option.key"
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
    required: {
      type: Boolean,
      default: false,
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
      default: (o) => (isObject(o) ? o.label : o),
    },
    optionKey: {
      type: Function,
      default: (o) => (isObject(o) ? o.value : o),
    },
    optionValue: {
      type: Function,
      default: (o) => (isObject(o) ? o.value : o),
    },
    optionDisabled: {
      type: Function,
      default: (o) => (isObject(o) ? o.disabled : false),
    },
    valueComparator: {
      type: Function,
      default: (a, b) => a === b,
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
        return {
          label: this.optionLabel(option),
          key: this.optionKey(option),
          value: this.optionValue(option),
          disabled: this.optionDisabled(option),
        };
      });
    },
    value: {
      get() {
        if (this.multiple) {
          return this.normalizedOptions
            .filter((o) => {
              return this.modelValue.some((v) => {
                return this.valueComparator(o.value, v);
              });
            })
            .map((o) => o.key);
        }

        const option = this.normalizedOptions.find((o) => {
          return o.value === this.modelValue;
        });
        return option?.key;
      },
      set(value) {
        if (this.multiple) {
          const values = this.normalizedOptions
            .filter((o) => {
              return value.includes(o.key);
            })
            .map((o) => o.value);
          this.$emit("update:modelValue", values);
          return;
        }

        const option = this.normalizedOptions.find((o) => {
          return o.key === value;
        });
        this.$emit("update:modelValue", option?.value);
      },
    },
  },
  methods: {
    onOptionMousedown(evt) {
      if (!this.multiple) return;

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
    }
  }

  &.multiple {
    :deep(label) {
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
