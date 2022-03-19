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
    <template v-if="readonly || disabled">
      <button
        :id="inputId"
        class="opener"
        :style="`color: ${modelValue};`"
        :disabled="disabled"
      ></button>
    </template>
    <tippy
      v-else
      trigger="click"
      role="dialog"
      content-tag="div"
      content-class="overlay"
      append-to="parent"
      placement="bottom"
      sticky="reference"
      max-width="none"
      :duration="0"
      :interactive="true"
      :popper-options="{ strategy: 'fixed' }"
    >
      <button
        :id="inputId"
        class="opener"
        :style="`color: ${modelValue};`"
      ></button>

      <template #content="{ hide }">
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
          <styled-button
            class="apply"
            role="primary"
            @click="onApplyClick(hide)"
          >
            {{ $t("apply_button") }}
          </styled-button>
          <styled-button class="cancel" role="secondary" @click="hide">
            {{ $t("cancel_button") }}
          </styled-button>
        </div>
      </template>
    </tippy>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import { isArray } from "lodash";
import { Tippy } from "vue-tippy";
import ColorPicker from "./color/ColorPicker.vue";
import ColorSwatches from "./color/ColorSwatches.vue";

export default {
  components: {
    Tippy,
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
    };
  },
  watch: {
    modelValue(value) {
      this.internalValue = value;
    },
  },
  mounted() {
    this.internalValue = this.modelValue;
  },
  methods: {
    isArray,
    onApplyClick(hide) {
      this.$emit("update:modelValue", this.internalValue);
      hide();
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
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

  ::v-deep(.overlay) {
    margin: 0 1em;
    width: 20em;
    background: $lightgray;
    border: 1px solid $mediumgray;
    box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.5);

    .tabs-nav {
      border: none;
    }

    .buttons {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      margin: 0.5em 0.75em;

      button {
        margin-right: 0.25em;
        color: $white;
        background: $lightgray;

        &.apply {
          background: $mediumgray;
        }
      }
    }
  }
}
</style>
