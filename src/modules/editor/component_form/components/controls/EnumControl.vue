<template>
  <div class="control enum" :data-property="property">
    <label v-if="label">{{ label }}</label>
    <div class="input-wrapper">
      <select @change.stop="onChange">
        <option v-for="v in schema.enum" :key="v">
          {{ v }}
        </option>
      </select>
      <arrow-icon class="icon" />
    </div>
  </div>
</template>

<script>
import ArrowIcon from "../../assets/icons/enum-arrow.svg?inline";

export default {
  components: {
    ArrowIcon,
  },
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

<style lang="scss" scoped>
.control {
  .input-wrapper {
    position: relative;
  }

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
