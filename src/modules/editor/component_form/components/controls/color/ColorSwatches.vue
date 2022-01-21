<template>
  <div class="color-swatches">
    <button
      v-for="color in normalizedSwatches"
      :key="color"
      type="button"
      :class="['swatch', { selected: color === selected }]"
      :style="`color: ${color}`"
      @click="onSwatchClick(color)"
    />
  </div>
</template>

<script>
import chroma from "chroma-js";
import { uniq } from "lodash";

export default {
  props: {
    value: {
      type: String,
      default: null,
    },
    swatches: {
      type: Array,
      default() {
        return [
          "#000000",
          "#cccccc",
          "#ffffff",
          "#f44336",
          "#e91e63",
          "#9c27b0",
          "#673ab7",
          "#3f51b5",
          "#2196f3",
          "#03a9f4",
          "#00bcd4",
          "#009688",
          "#4caf50",
          "#8bc34a",
          "#cddc39",
          "#ffeb3b",
          "#ffc107",
        ];
      },
    },
  },
  emits: ["change"],
  data() {
    return {
      selected: null,
    };
  },
  computed: {
    normalizedSwatches() {
      const normalized = [];
      this.swatches.forEach((value) => {
        if (chroma.valid(value)) {
          normalized.push(chroma(value).css());
        }
      });
      return uniq(normalized);
    },
    chroma() {
      return this.selected ? chroma.css(this.selected) : null;
    },
    rgb() {
      return this.chroma?.rgb();
    },
    css() {
      return this.chroma?.css();
    },
    hex() {
      return this.chroma?.hex();
    },
    alpha() {
      return this.chroma?.alpha();
    },
  },
  watch: {
    value: {
      handler(value) {
        this.setSelected(value, true);
      },
      immediate: true,
    },
  },
  methods: {
    setSelected(value, validate = false) {
      if (!validate) {
        this.selected = value;
        return;
      }

      if (chroma.valid(value)) {
        const normalized = chroma(value).css();
        if (this.normalizedSwatches.includes(normalized)) {
          this.selected = normalized;
        }
      }
    },
    onSwatchClick(value) {
      this.setSelected(value);
      this.emitChange();
    },
    emitChange() {
      this.$emit("change", this.css);
    },
  },
};
</script>

<style lang="scss" scoped>
.color-swatches {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  row-gap: 0.5em;
  column-gap: 0.5em;
  margin: 0.75em;

  .swatch {
    padding: 0;
    opacity: 1;
    cursor: pointer;

    &::after {
      content: "";
      display: block;
      width: 100%;
      padding-top: 100%;
      background-color: currentColor;
      border-radius: 0.2em;
      box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.5);
    }

    &:hover,
    &.selected {
      &::after {
        box-shadow: none;
      }
    }

    &.selected {
      &::after {
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: 2px;
      }
    }
  }
}
</style>
