<template>
  <select @change.stop="onChange">
    <option v-for="v in schema.enum" :key="v">
      {{ v }}
    </option>
  </select>
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
      type: String,
      default: "",
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
