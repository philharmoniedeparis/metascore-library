<template>
  <form-group
    :class="['control', 'select', { readonly, disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <div class="input-container">
      <select
        :id="inputId"
        v-model="value"
        :readonly="readonly"
        :disabled="disabled"
      >
        <option v-for="(v, l) in options" :key="v" :value="v">
          {{ l }}
        </option>
      </select>
      <arrow-icon class="icon" />
    </div>
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
    description: {
      type: String,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
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
  .input-container {
    position: relative;
  }

  select {
    display: inline-block;
    font-family: inherit;
    width: auto;
    max-width: 100%;
    margin: 0;
    padding-right: 2.5em;
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
