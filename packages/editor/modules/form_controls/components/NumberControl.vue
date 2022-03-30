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
        :readonly="readonly"
        :disabled="disabled"
        @change="onInputChange"
      />
      <div v-if="spinners && !readonly && !disabled" class="spinners">
        <button
          type="button"
          @mousedown="onSpinUpMousedown"
          @mouseup="onSpinUpMouseup"
          @mouseout="onSpinUpMouseout"
        >
          <span aria-hidden="true"><spin-up-icon class="icon" /></span>
          <span class="sr-only">+</span>
        </button>
        <button
          type="button"
          @mousedown="onSpinDownMousedown"
          @mouseup="onSpinDownMouseup"
          @mouseout="onSpinDownMouseout"
        >
          <span aria-hidden="true"><spin-down-icon class="icon" /></span>
          <span class="sr-only">-</span>
        </button>
      </div>
    </div>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import { round } from "lodash";
import { countDecimals } from "@metascore-library/core/utils/number";
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
        return this.modelValue;
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
  ::v-deep(input::-webkit-outer-spin-button),
  ::v-deep(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }
  /* Firefox */
  input {
    -moz-appearance: textfield;
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
    background-color: $darkgray;

    button {
      flex: 0 0 50%;
      padding: 0;
      color: $white;
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

        button .icon {
          ::v-deep(path) {
            transform-origin: 50% 50%;
            transform: rotate(90deg);
          }
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
