<template>
  <component
    :is="`${control}-control`"
    v-model="value"
    :label="displayLabel ? schema.title : null"
    :property="property"
    :schema="flattenedSchema"
    :validator="validator"
  />
</template>

<script>
import { flatten } from "../../utils/schema";
import BooleanControl from "./BooleanControl.vue";
import BorderRadiusControl from "./BorderRadiusControl.vue";
import ColorControl from "./ColorControl.vue";
import EnumControl from "./EnumControl.vue";
import HtmlControl from "./HtmlControl.vue";
import ImageControl from "./ImageControl.vue";
import NumberControl from "./NumberControl.vue";
import StringControl from "./StringControl.vue";
import TimeControl from "./TimeControl.vue";

export default {
  components: {
    BooleanControl,
    BorderRadiusControl,
    ColorControl,
    EnumControl,
    HtmlControl,
    ImageControl,
    NumberControl,
    StringControl,
    TimeControl,
  },
  props: {
    property: {
      type: String,
      default: null,
    },
    schema: {
      type: Object,
      required: true,
    },
    validator: {
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
  beforeCreate() {
    // Register complex components here to workaround circular reference issues.
    this.$options.components = this.$options.components || {};
    this.$options.components.ArrayControl = require("./ArrayControl").default;
    this.$options.components.AnimatedControl =
      require("./AnimatedControl").default;
  },
};
</script>
