<template>
  <form-group
    :class="['control', 'checkbox', { disabled }]"
    :label="label"
    :label-for="inputId"
    label-position="after"
    :description="description"
    :required="required"
  >
    <div class="input-container">
      <input
        :id="inputId"
        v-model="value"
        v-autofocus="autofocus"
        :disabled="disabled"
        type="checkbox"
      />
      <label :for="inputId">
        <slot>
          <check-icon class="icon" />
        </slot>
      </label>
    </div>

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import CheckIcon from "../assets/icons/checkbox-check.svg?component";

export default {
  components: {
    CheckIcon,
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
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
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

  .input-wrapper {
    flex-direction: row;
    align-items: baseline;
  }

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
    background: var(--metascore-color-white);
    cursor: pointer;

    .icon {
      position: absolute;
      top: -0.1em;
      left: 0.2em;
      width: 1em;
      color: var(--metascore-color-black);
      pointer-events: none;
    }
  }

  input:not(:checked) + label {
    .icon {
      display: none;
    }
  }

  &.disabled {
    input + label {
      opacity: 0.5;
      cursor: default;
    }
  }

  &.error {
    .input-container {
      outline: 2px solid var(--metascore-color-danger);
    }
  }
}
</style>
