<template>
  <form-group class="control select" :label="label" :label-for="inputId">
    <select :id="inputId" v-model="value">
      <option v-for="(l, v) in options" :key="v" :value="v">
        {{ l }}
      </option>
    </select>
    <arrow-icon class="icon" />
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import ArrowIcon from "../assets/icons/enum-arrow.svg?inline";

export default {
  components: {
    ArrowIcon,
  },
  props: {
    label: {
      type: String,
      default: null,
    },
    options: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: [String, Number],
      default: null,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      inputId: uuid(),
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  select {
    display: inline-block;
    font-family: inherit;
    width: auto;
    max-width: 100%;
    margin: 0;
    padding: 0.25em 2.5em 0.25em 0.5em;
    border: 0;
    font-family: inherit;
    color: $white;
    box-sizing: border-box;
    border-radius: 0.25em;
    background-color: $mediumgray;
    appearance: none;

    &::-ms-expand {
      display: none;
    }

    option {
      font-weight: normal;
      background: $mediumgray;
    }

    &[multiple] {
      padding: 0;

      + .icon {
        display: none;
      }
    }
  }

  .icon {
    position: absolute;
    top: 0;
    right: 0.5em;
    width: 1em;
    height: 100%;
    color: $white;
    pointer-events: none;
  }
}
</style>
