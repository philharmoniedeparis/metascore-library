<i18n>
{
  "en": {
    "apply_button": "Appliquer",
    "cancel_button": "Cancel",
  },
  "fr": {
    "apply_button": "Appliquer",
    "cancel_button": "Annuler",
  },
}
</i18n>

<template>
  <form-group
    :class="['control', 'color', { readonly, disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <button
      :id="inputId"
      ref="opener"
      v-autofocus="autofocus"
      class="opener"
      :style="`color: ${modelValue};`"
      :disabled="disabled"
      @click="onOpenerClick"
    ></button>

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>

    <div
      v-if="showOverlay"
      ref="overlay"
      class="overlay"
      tabindex="-1"
      :style="overlayStyle"
      @blur="onOverlayBlur"
      @mousedown.prevent
    >
      <tabs-container>
        <tabs-item v-if="picker" title="Picker">
          <color-picker v-model="internalValue" />
        </tabs-item>
        <tabs-item v-if="swatches" title="Swatches">
          <color-swatches
            v-model="internalValue"
            v-bind="isArray(swatches) ? { swatches } : null"
          />
        </tabs-item>
      </tabs-container>
      <div class="buttons">
        <styled-button class="apply" role="primary" @click="onApplyClick(hide)">
          {{ $t("apply_button") }}
        </styled-button>
        <styled-button class="cancel" role="secondary" @click="onCancelClick">
          {{ $t("cancel_button") }}
        </styled-button>
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
import { v4 as uuid } from "uuid";
import { isArray } from "lodash";
import ColorPicker from "./color/ColorPicker.vue";
import ColorSwatches from "./color/ColorSwatches.vue";

export default {
  components: {
    ColorPicker,
    ColorSwatches,
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
    modelValue: {
      type: String,
      default: "",
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
      internalValue: null,
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
  mounted() {
    this.internalValue = this.modelValue;
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

      console.log(x, y);
    },
    onOpenerClick() {
      this.showOverlay = true;
    },
    onOverlayBlur() {
      this.showOverlay = false;
    },
    onApplyClick() {
      this.showOverlay = false;
      this.$emit("update:modelValue", this.internalValue);
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
    border-radius: 0.25em;
    box-shadow: 0.05em 0.05em 0.5em 0.1em rgba(0, 0, 0, 0.25);
    opacity: 1;
    transition: none;
    overflow: hidden;

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
    background: $lightgray;
    border: 1px solid $mediumgray;
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
        color: $white;
        background: $darkgray;

        &.secondary {
          background: $mediumgray;
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
}
</style>
