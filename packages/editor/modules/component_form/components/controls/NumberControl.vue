<template>
  <div class="control number" :data-property="property">
    <label v-if="label">{{ label }}</label>
    <div class="input-wrapper">
      <input
        ref="input"
        v-model="value"
        type="number"
        :step="step"
        :min="min"
        :max="max"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <div :class="['spinners', spinnersDirection, { flip: flipSpinners }]">
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
  </div>
</template>

<script>
import { round } from "lodash";
import { countDecimals } from "@metascore-library/core/utils/number";
import SpinUpIcon from "../../assets/icons/number-up.svg?inline";
import SpinDownIcon from "../../assets/icons/number-down.svg?inline";

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
    property: {
      type: String,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    spinnersDirection: {
      type: String,
      default: "vertical",
    },
    flipSpinners: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      isFocused: false,
      spinCount: 0,
      timeout: null,
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", round(value, this.decimals));
      },
    },
    step() {
      return this.schema.type === "integer"
        ? 1
        : this.schema.multipleOf || 0.01;
    },
    decimals() {
      return countDecimals(this.step);
    },
    min() {
      return this.schema.minimum;
    },
    max() {
      return this.schema.maximum;
    },
  },
  methods: {
    updateValue(value) {
      if (!isNaN(this.min)) {
        value = Math.max(value, this.min);
      }
      if (!isNaN(this.max)) {
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
  .input-wrapper {
    position: relative;
  }

  /* Chrome, Safari, Edge, Opera */
  ::v-deep(input::-webkit-outer-spin-button),
  ::v-deep(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  ::v-deep(input) {
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
      padding: 0;
      color: $white;
    }

    &.horizontal {
      width: 2em;
      flex-direction: row-reverse;
    }

    &.flip {
      transform-origin: center;
      transform: rotate(180deg);
    }
  }

  &:not(:hover) {
    .spinners {
      display: none;
    }
  }
}
</style>
