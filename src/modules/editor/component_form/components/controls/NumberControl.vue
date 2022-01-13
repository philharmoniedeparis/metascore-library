<template>
  <input
    type="number"
    :step="step"
    :min="min"
    :max="max"
    :value="value"
    @change.stop="onChange"
  />
</template>

<script>
export default {
  props: {
    property: {
      type: String,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  emits: ["change"],
  computed: {
    step() {
      return this.schema.type === "integer"
        ? 1
        : this.schema.multipleOf || 0.01;
    },
    min() {
      return this.schema.minimum;
    },
    max() {
      return this.schema.maximum;
    },
  },
  methods: {
    onChange(evt) {
      this.$emit("change", {
        property: this.property,
        value: evt.target.value,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
