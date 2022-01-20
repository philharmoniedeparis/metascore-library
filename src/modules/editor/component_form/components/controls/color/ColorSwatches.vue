<template>
  <div class="color-swatches">
    <button
      v-for="color in swatches"
      :key="color"
      type="button"
      class="swatch"
      :style="`color: ${color}`"
    />
  </div>
</template>

<script>
export default {
  props: {
    swatches: {
      type: Array,
      default() {
        return [];
      },
    },
    value: {
      type: String,
      default: "",
    },
  },
  emits: ["select"],
  methods: {
    onSwatchClick() {
      this.$emit("select");
    },
  },
};
</script>

<style lang="scss" scoped>
.color-swatches {
  display: grid;
  grid-template-columns: repeat(15, 1fr);

  .swatch {
    padding: 0;
    margin: 0 -1px -1px 0;
    border: 1px solid $darkgray;
    opacity: 1;
    cursor: pointer;

    &::after {
      content: "";
      display: inline-block;
      width: 100%;
      padding-top: 100%;
      background-color: currentColor;
      vertical-align: bottom;
      transition: transform 0.1s;
    }

    &:hover {
      &::after {
        transform: scale(1.5);
      }
    }
  }
}
</style>
