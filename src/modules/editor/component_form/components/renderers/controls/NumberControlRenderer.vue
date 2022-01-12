<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <div class="control-inner">
      <input
        ref="input"
        type="number"
        :step="step"
        :min="min"
        :max="max"
        :id="control.id + '-input'"
        :class="styles.control.input"
        :value="control.data"
        :disabled="!control.enabled"
        :autofocus="appliedOptions.focus"
        :placeholder="appliedOptions.placeholder"
        @change="onChange"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown="onKeyDown"
        @wheel="onWheel"
      />
      <div :class="['spinners', spinnersDirection, { flip: flipSpinners }]">
        <button
          type="button"
          @mousedown="onSpinUpMousedown"
          @mouseup="onSpinUpMouseup"
          @mouseout="onSpinUpMouseout"
        >
          <span aria-hidden="true"><spin-up-icon class="icon" /></span>
          <span class="ms--sr-only">+</span>
        </button>
        <button
          type="button"
          @mousedown="onSpinDownMousedown"
          @mouseup="onSpinDownMouseup"
          @mouseout="onSpinDownMouseout"
        >
          <span aria-hidden="true"><spin-down-icon class="icon" /></span>
          <span class="ms--sr-only">-</span>
        </button>
      </div>
    </div>
  </control-wrapper>
</template>

<script>
import { isNumberControl } from "@jsonforms/core";
import { rendererProps, useJsonFormsControl } from "@jsonforms/vue";
import { ControlWrapper } from "@jsonforms/vue-vanilla";
import { useVanillaControl } from "@jsonforms/vue-vanilla";
import SpinUpIcon from "../../../assets/icons/spin-up.svg?inline";
import SpinDownIcon from "../../../assets/icons/spin-down.svg?inline";

export default {
  components: {
    ControlWrapper,
    SpinUpIcon,
    SpinDownIcon,
  },
  props: {
    ...rendererProps(),
  },
  computed: {
    step() {
      const defaultStep = isNumberControl(this.uischema, this.schema) ? 0.1 : 1;
      return this.control.schema.multipleOf || defaultStep;
    },
    min() {
      return this.control.schema.minimum;
    },
    max() {
      return this.control.schema.maximum;
    },
    spinnersDirection() {
      return this.appliedOptions.spinnersDirection ?? "vertical";
    },
    flipSpinners() {
      return this.appliedOptions.flipSpinners ?? false;
    },
  },
  data() {
    return {
      spinCount: 0,
      timeout: null,
    };
  },
  methods: {
    onKeyDown(evt) {
      switch (evt.key) {
        case "ArrowUp":
          this.stepUp();
          break;

        case "ArrowDown":
          this.stepDown();
          break;
      }
    },
    onWheel() {
      // @todo
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
      this.$refs.input.stepUp();

      if (loop) {
        this.timeout = setTimeout(() => {
          this.stepUp(true);
        }, this.getSpinDelay());
      }
    },
    stepDown(loop = false) {
      this.$refs.input.stepDown();

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
  setup(props) {
    return useVanillaControl(useJsonFormsControl(props), (target) => {
      return Number(target.value);
    });
  },
};
</script>

<style lang="scss" scoped>
.control-inner {
  position: relative;

  /* Chrome, Safari, Edge, Opera */
  ::v-deep(input::-webkit-outer-spin-button),
  ::v-deep(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  ::v-deep(input[type="number"]) {
    -moz-appearance: textfield;
  }

  ::v-deep(.spinners) {
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    width: 2em;
    height: 100%;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    background-color: #3f3f3f;

    &.horizontal {
      width: 1em;
      flex-direction: row-reverse;
    }

    &.flip {
      transform-origin: center;
      transform: rotate(180deg);
    }
  }

  &:not(:hover) {
    ::v-deep(.spinners) {
      display: none;
    }
  }
}
</style>
