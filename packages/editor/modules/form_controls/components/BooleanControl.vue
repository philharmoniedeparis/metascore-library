<template>
  <form-group
    class="control boolean"
    :data-property="property"
    :label="label"
    :label-for="inputId"
  >
    <input :id="inputId" v-model="value" type="checkbox" />
    <label :for="inputId">
      <slot>
        <check-icon class="icon" />
      </slot>
    </label>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import CheckIcon from "../assets/icons/boolean-check.svg?inline";

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
    modelValue: {
      type: Boolean,
      default: false,
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

    .icon {
      position: absolute;
      top: -0.1em;
      left: 0.2em;
      width: 1em;
      color: $black;
      pointer-events: none;
    }
  }

  input:not(:checked) + label {
    .icon {
      display: none;
    }
  }
}
</style>
