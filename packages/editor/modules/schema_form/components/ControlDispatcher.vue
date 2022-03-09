<template>
  <component
    :is="`${control}-control`"
    v-model="value"
    :label="displayLabel ? schema.title : null"
    :property="property"
    :schema="flattenedSchema"
  />
</template>

<script>
import { flatten } from "../utils/schema";

export default {
  inject: ["validator"],
  props: {
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
        return "enum";
      }

      if (this.flattenedSchema.type === "integer") {
        return "number";
      }

      return this.flattenedSchema.type || "string";
    },
  },
};
</script>
