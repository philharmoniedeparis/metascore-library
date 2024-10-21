<template>
  <form-group
    :class="[
      'control',
      'number',
      { readonly, disabled },
      spinners ? 'has-spinners' : null,
      spinners ? `${spinnersDirection}-spinners` : null,
      spinners && flipSpinners ? 'flip-spinners' : null,
    ]"
    :label="label"
    :label-for="inputId"
    :description="description"
    :required="required"
  >
    <div
      class="input-container"
      @focusin="onInputFocus"
      @focusout="onInputBlur"
    >
      <input
        :id="inputId"
        ref="input"
        v-model="value"
        v-autofocus="autofocus"
        type="number"
        :step="step"
        :min="min"
        :max="max"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        @change="onInputChange"
      />
      <div v-if="spinners && !readonly && !disabled" class="spinners">
        <base-button
          type="button"
          tabindex="-1"
          @mousedown="onSpinUpMousedown"
          @mouseup="onSpinUpMouseup"
          @mouseout="onSpinUpMouseout"
        >
          <template #icon><spin-up-icon /></template>
        </base-button>
        <base-button
          type="button"
          tabindex="-1"
          @mousedown="onSpinDownMousedown"
          @mouseup="onSpinDownMouseup"
          @mouseout="onSpinDownMouseout"
        >
          <template #icon><spin-down-icon /></template>
        </base-button>
      </div>
    </div>

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import { round } from "lodash";
import { countDecimals } from "@core/utils/number";
import SpinUpIcon from "../assets/icons/number-up.svg?inline";
import SpinDownIcon from "../assets/icons/number-down.svg?inline";

export default {
  components: {
    SpinUpIcon,
    SpinDownIcon,
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
    placeholder: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    readonly: {
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
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    step: {
      type: Number,
      default: 1,
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    lazy: {
      type: Boolean,
      default: false,
    },
    spinners: {
      type: Boolean,
      default: true,
    },
    spinnersDirection: {
      type: String,
      default: "vertical",
      validator(value) {
        return ["vertical", "horizontal"].includes(value);
      },
    },
    flipSpinners: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "blur", "focus"],
  data() {
    return {
      inputId: uuid(),
      isFocused: false,
      spinCount: 0,
      timeout: null,
    };
  },
  computed: {
    decimals() {
      return countDecimals(this.step);
    },
    value: {
      get() {
        return round(this.modelValue, this.decimals);
      },
      set(value) {
        if (!this.lazy) {
          this.$emit("update:modelValue", round(value, this.decimals));
        }
      },
    },
  },
  methods: {
    onInputFocus() {
      this.isFocused = false;
      this.$emit("focus");
    },
    onInputBlur() {
      this.isFocused = false;
      this.$emit("blur");
    },
    onInputChange(evt) {
      if (this.lazy) {
        this.$emit("update:modelValue", evt.target.value);
      }
    },
    updateValue(value) {
      if (this.min !== null) {
        value = Math.max(value, this.min);
      }
      if (this.max !== null) {
        value = Math.min(value, this.max);
      }

      this.value = value;
    },
    onSpinUpMousedown() {
      this.stepUp(true);
    },
    onSpinUpMouseup() {
      this.clearTimeout();
    },
    onSpinUpMouseout() {
      this.clearTimeout();
    },
    onSpinDownMousedown() {
      this.stepDown(true);
    },
    onSpinDownMouseup() {
      this.clearTimeout();
    },
    onSpinDownMouseout() {
      this.clearTimeout();
    },
    stepUp(loop = false) {
      this.updateValue(Number(this.$refs.input.value) + this.step);

      if (loop) {
        this.timeout = setTimeout(() => {
          this.stepUp(true);
        }, this.getSpinDelay());
      }
    },
    stepDown(loop = false) {
      this.updateValue(Number(this.$refs.input.value) - this.step);

      if (loop) {
        this.timeout = setTimeout(() => {
          this.stepDown(true);
        }, this.getSpinDelay());
      }
    },
    getSpinDelay() {
      const delay =
        this.spinCount === 0 ? 500 : Math.max(200 / this.spinCount, 20);
      this.spinCount++;
      return delay;
    },
    clearTimeout() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.spinCount = 0;
        this.timeout = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  .input-container {
    position: relative;
    border-radius: 0.25em;
    overflow: hidden;
  }

  /* Chrome, Safari, Edge, Opera */
  :deep(input::-webkit-outer-spin-button),
  :deep(input::-webkit-inner-spin-button) {
    appearance: none;
    margin: 0;
  }
  /* Firefox */
  input {
    appearance: textfield;
  }

  .spinners {
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    width: 1em;
    height: 100%;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    background-color: var(--metascore-color-bg-tertiary);

    button.base-button {
      flex: 0 0 50%;
      padding: 0;
      color: var(--metascore-color-white);
    }
  }

  &.has-spinners {
    // #\9 is used here to increase specificity.
    input:not(#\9) {
      padding-right: 1.3125em;
    }

    &.horizontal-spinners {
      // #\9 is used here to increase specificity.
      input:not(#\9) {
        padding-right: 2.3125em;
      }

      .spinners {
        width: 2em;
        flex-direction: row-reverse;

        :deep(button .icon path) {
          transform-origin: 50% 50%;
          transform: rotate(90deg);
        }
      }
    }

    &.flip-spinners {
      .spinners {
        transform-origin: center;
        transform: rotate(180deg);
      }
    }
  }

  &:not(:hover) {
    .spinners {
      display: none;
    }
  }

  &.disabled {
    input {
      opacity: 0.5;
    }
  }
}
</style>
