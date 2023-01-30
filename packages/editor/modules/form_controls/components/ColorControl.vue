<i18n>
{
  "fr": {
    "apply_button": "Appliquer",
    "clear_button": "Effacer",
    "cancel_button": "Annuler",
  },
  "en": {
    "apply_button": "Appliquer",
    "clear_button": "Clear",
    "cancel_button": "Cancel",
  },
}
</i18n>

<template>
  <form-group
    :class="['control', 'color', { readonly, disabled, empty: !modelValue }]"
    :label="label"
    :label-for="inputId"
    :description="description"
    :required="required"
  >
    <button
      :id="inputId"
      ref="opener"
      v-autofocus="autofocus"
      type="button"
      class="opener"
      :style="`color: ${modelValue};`"
      :disabled="disabled"
      @click="onOpenerClick"
    >
      <span v-if="!modelValue" aria-hidden="true">
        <clear-icon class="icon" />
      </span>
    </button>

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>

    <div
      v-if="showOverlay"
      ref="overlay"
      class="overlay"
      tabindex="-1"
      :style="overlayStyle"
      @focusout="onOverlayFocusout"
    >
      <tabs-container>
        <tabs-item v-if="picker" title="Picker" :keep-alive="true">
          <color-picker v-model="internalValue" />
        </tabs-item>
        <tabs-item v-if="swatches" title="Swatches" :keep-alive="true">
          <color-swatches
            v-model="internalValue"
            v-bind="isArray(swatches) ? { swatches } : null"
          />
        </tabs-item>
      </tabs-container>
      <div class="buttons">
        <base-button class="apply" role="primary" @click="onApplyClick">
          {{ $t("apply_button") }}
        </base-button>
        <base-button
          v-if="!required"
          class="clear"
          role="secondary"
          @click="onClearClick"
        >
          {{ $t("clear_button") }}
        </base-button>
        <base-button class="cancel" role="secondary" @click="onCancelClick">
          {{ $t("cancel_button") }}
        </base-button>
      </div>
    </div>
  </form-group>
</template>

<script>
import {
  computePosition,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/dom";
import chroma from "chroma-js";
import { v4 as uuid } from "uuid";
import { isArray } from "lodash";
import ColorPicker from "./color/ColorPicker.vue";
import ColorSwatches from "./color/ColorSwatches.vue";
import ClearIcon from "../assets/icons/color-clear.svg?inline";

export default {
  components: {
    ColorPicker,
    ColorSwatches,
    ClearIcon,
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
    modelValue: {
      type: String,
      default: "",
    },
    format: {
      type: String,
      default: "auto",
    },
    picker: {
      type: Boolean,
      default: true,
    },
    swatches: {
      type: [Boolean, Array],
      default: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      inputId: uuid(),
      internalValue: this.modelValue,
      showOverlay: false,
      overlayStyle: null,
      overlayUpdateCleanup: null,
    };
  },
  watch: {
    modelValue(value) {
      this.internalValue = value;
    },
    showOverlay(value) {
      if (value) {
        this.$nextTick(function () {
          this.$refs.overlay.focus();
          this.updateOverlayStyle();
          this.overlayUpdateCleanup = autoUpdate(
            this.$refs.opener,
            this.$refs.overlay,
            this.updateOverlayStyle,
            {
              elementResize: false,
            }
          );
        });
      } else if (this.overlayUpdateCleanup) {
        this.overlayUpdateCleanup();
        this.overlayUpdateCleanup = null;
      }
    },
  },
  methods: {
    isArray,
    async updateOverlayStyle() {
      const { x, y } = await computePosition(
        this.$refs.opener,
        this.$refs.overlay,
        {
          strategy: "fixed",
          placement: "bottom",
          middleware: [offset(10), flip(), shift({ padding: 10 })],
        }
      );

      this.overlayStyle = {
        left: `${x}px`,
        top: `${y}px`,
      };
    },
    onOpenerClick() {
      this.showOverlay = true;
    },
    onOverlayFocusout(evt) {
      if (!evt.currentTarget.contains(evt.relatedTarget)) {
        this.showOverlay = false;
      }
    },
    onApplyClick() {
      this.showOverlay = false;

      let value = this.internalValue;
      switch (this.format) {
        case "rgb":
        case "rgba":
        case "hsl":
        case "hsv":
        case "hex":
        case "css":
          value = chroma(value)[this.format]();
          break;
      }
      this.$emit("update:modelValue", value);
    },
    onClearClick() {
      this.showOverlay = false;
      this.$emit("update:modelValue", null);
    },
    onCancelClick() {
      this.showOverlay = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  position: relative;

  .opener {
    position: relative;
    width: 1.5em;
    height: 1.5em;
    padding: 0;
    vertical-align: middle;
    @include transparency-grid;
    background-size: 0.75em;
    color: transparent;
    border-radius: 0.25em;
    box-shadow: 0.05em 0.05em 0.5em 0.1em rgba(0, 0, 0, 0.25);
    opacity: 1;
    transition: none;
    overflow: hidden;

    .icon {
      padding: 0.25em;
      color: var(--color-bg-primary);
      background-color: var(--color-bg-secondary);
      box-sizing: content-box;
    }

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: currentColor;
    }
  }

  .overlay {
    position: fixed;
    width: 20em;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-bg-secondary);
    box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.5);
    z-index: 9999;

    .tabs-nav {
      border: none;
    }

    .buttons {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      margin: 0.5em 0.75em;
      gap: 0.5em;

      button {
        padding: 0.5em;
        background: var(--color-bg-primary);

        &.secondary {
          background: var(--color-bg-secondary);
        }
      }
    }
  }

  &.disabled {
    .opener {
      opacity: 0.5;
      cursor: default;
    }
  }

  &.error {
    .opener {
      outline: 2px solid var(--color-danger);
    }
  }
}
</style>
