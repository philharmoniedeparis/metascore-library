<template>
  <div :class="['control', control]" :data-property="property">
    <label v-if="displayLabel && schema.title">{{ schema.title }}</label>
    <component
      :is="`${control}-control`"
      :property="property"
      :schema="schema"
      :flattened-schema="flattened"
      :value="value"
      @change="onChange"
    />
  </div>
</template>

<script>
import { flatten } from "../../utils/schema";
import StringControl from "./StringControl.vue";
import BooleanControl from "./BooleanControl.vue";
import NumberControl from "./NumberControl.vue";
import EnumControl from "./EnumControl.vue";
import TimeControl from "./TimeControl.vue";
import ImageControl from "./ImageControl.vue";
import ColorControl from "./ColorControl.vue";
import BorderRadiusControl from "./BorderRadiusControl.vue";

export default {
  components: {
    StringControl,
    BooleanControl,
    NumberControl,
    EnumControl,
    TimeControl,
    ImageControl,
    ColorControl,
    BorderRadiusControl,
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
    flattened() {
      return flatten(this.schema, this.getAjv(), this.value);
    },
    control() {
      if (this.flattened.format) {
        return this.flattened.format;
      }

      if (this.flattened.enum) {
        return "enum";
      }

      if (this.flattened.type === "integer") {
        return "number";
      }

      return this.flattened.type || "string";
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

<style lang="scss" scoped></style>
