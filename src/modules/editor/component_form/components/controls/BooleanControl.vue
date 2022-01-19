<template>
  <div class="control boolean" :data-property="property">
    <label v-if="label">{{ label }}</label>
    <input
      :id="inputId"
      v-model="checked"
      type="checkbox"
      :checked="value"
      @change.stop="onChange"
    />
    <label :for="inputId">
      <slot>
        <check-icon />
      </slot>
    </label>
  </div>
</template>

<script>
import { v4 as uuid } from "uuid";
import CheckIcon from "../../assets/icons/check.svg?inline";

export default {
  components: {
    CheckIcon,
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
      type: Boolean,
      default: false,
    },
  },
  emits: ["change"],
  data() {
    return {
      inputId: uuid(),
      checked: false,
    };
  },
  methods: {
    onChange(evt) {
      this.$emit("change", {
        property: this.property,
        value: evt.target.checked,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../../../assets/css/theme.scss";

.control {
  position: relative;
  cursor: pointer;

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: 0;
    visibility: hidden;
    z-index: -1;
  }

  input + label {
    position: relative;
    display: block;
    width: 1em;
    height: 1em;
    background: $white;
    cursor: pointer;

    svg {
      position: absolute;
      top: -0.1em;
      left: 0.2em;
      width: 1em;
      color: $black;
      pointer-events: none;
    }
  }

  input:not(:checked) + label {
    svg {
      display: none;
    }
  }
}
</style>
