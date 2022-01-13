<template>
  <input type="checkbox" :checked="value" @change.stop="onChange" />
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
      type: Boolean,
      default: false,
    },
  },
  emits: ["change"],
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
