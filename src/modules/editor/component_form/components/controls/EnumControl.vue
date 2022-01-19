<template>
  <div class="control enum" :data-property="property">
    <label v-if="label">{{ label }}</label>
    <select @change.stop="onChange">
      <option v-for="v in schema.enum" :key="v">
        {{ v }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: null,
    },
    property: {
      type: String,
      required: true,
    },
    schema: {
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
