<template>
  <component
    :is="`${control}-control`"
    v-model="value"
    :label="displayLabel ? schema.title : null"
    :readonly="readonly"
    :disabled="disabled"
    v-bind="extraProps"
  />
</template>

<script>
import { flatten } from "../utils/schema";

export default {
  inject: ["validator"],
  props: {
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    property: {
      type: String,
      default: null,
    },
    schema: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: [String, Number, Boolean, Array, Object],
      default: null,
    },
    displayLabel: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue"],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    flattenedSchema() {
      return flatten(this.schema, this.validator, this.value);
    },
    control() {
      if (this.flattenedSchema.format) {
        return this.flattenedSchema.format;
      }

      if (this.flattenedSchema.enum) {
        return "select";
      }

      if (this.flattenedSchema.type === "integer") {
        return "number";
      }

      if (this.flattenedSchema.type === "boolean") {
        return "checkbox";
      }

      if (this.flattenedSchema.type === "string") {
        return "text";
      }

      return this.flattenedSchema.type || "text";
    },
    extraProps() {
      if (["array", "object"].includes(this.flattenedSchema.type)) {
        // Pass down the property and schema to complex controls.
        return {
          property: this.property,
          schema: this.flattenedSchema,
        };
      }

      switch (this.control) {
        case "number":
          return {
            step:
              this.flattenedSchema.type === "integer"
                ? 1
                : this.flattenedSchema.multipleOf || 0.01,
            min: this.flattenedSchema.minimum,
            max: this.flattenedSchema.maximum,
          };

        case "select":
          return {
            options: this.flattenedSchema.enum.reduce(
              (acc, el) => ({ ...acc, [el]: el }),
              {}
            ),
          };
      }

      return null;
    },
  },
};
</script>
