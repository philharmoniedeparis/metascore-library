<template>
  <component :is="`${control}-control`" v-model="value" :label="displayLabel ? schema.title : null" :required="required"
    :readonly="readonly" :disabled="disabled" v-bind="extraProps" />
</template>

<script>
export default {
  inject: ["validator"],
  props: {
    type: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
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
    control() {
      if (this.type) {
        return this.type;
      }

      if (this.schema.format) {
        return this.schema.format;
      }

      if (this.schema.enum) {
        return "select";
      }

      if (this.schema.type === "integer") {
        return "number";
      }

      if (this.schema.type === "boolean") {
        return "checkbox";
      }

      if (this.schema.type === "string") {
        return "text";
      }

      return this.schema.type || "text";
    },
    extraProps() {
      switch (this.control) {
        case "number":
          return {
            step:
              this.schema.type === "integer"
                ? 1
                : this.schema.multipleOf || 0.01,
            min: this.schema.minimum,
            max: this.schema.maximum,
          };

        case "select":
          if (this.schema.enum) {
            return {
              options: this.schema.enum,
            };
          }
      }

      if (!this.type && ["array", "object"].includes(this.schema.type)) {
        // Pass down the property and schema to complex controls.
        return {
          property: this.property,
          schema: this.schema,
        };
      }

      return null;
    },
  },
};
</script>
