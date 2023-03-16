<template>
  <div class="color-swatches">
    <base-button
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
    modelValue: {
      type: String,
      default: null,
    },
    swatches: {
      type: Array,
      default() {
        return [
          ...chroma.scale(["black", "white"]).mode("hsl").colors(10),
          ...chroma
            .scale([
              "red",
              "orange",
              "yellow",
              "green",
              "blue",
              "pink",
              "purple",
            ])
            .mode("hsl")
            .colors(40),
        ];
      },
    },
  },
  emits: ["update:modelValue"],
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
    css() {
      return this.chroma?.css();
    },
  },
  watch: {
    modelValue(value) {
      this.setSelected(value, true);
    },
  },
  mounted() {
    this.setSelected(this.modelValue, true);
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
          return;
        }
      }

      this.selected = null;
    },
    onSwatchClick(value) {
      this.setSelected(value);
      this.$emit("update:modelValue", this.css);
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
    width: 100%;
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
