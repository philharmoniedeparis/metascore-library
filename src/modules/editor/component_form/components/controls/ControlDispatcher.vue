<template>
  <component
    :is="`${control}-control`"
    :label="displayLabel ? schema.title : null"
    :property="property"
    :schema="flattenedSchema"
    :value="value"
    @change="onChange"
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
  inject: ["getAjv"],
  props: {
    property: {
      type: String,
      default: null,
    },
    schema: {
      type: Object,
      required: true,
    },
    value: {
      type: [String, Number, Boolean, Array, Object],
      default: null,
    },
    displayLabel: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["change"],
  computed: {
    flattenedSchema() {
      return flatten(this.schema, this.getAjv(), this.value);
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
  methods: {
    onChange(evt) {
      this.$emit("change", evt);
    },
  },
};
</script>
