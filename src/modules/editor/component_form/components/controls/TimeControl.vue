<template>
  <input :value="value" @change.stop="onChange" />
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
    flattenedSchema: {
      type: Object,
      required: true,
    },
    value: {
      type: Number,
      default: 0,
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
