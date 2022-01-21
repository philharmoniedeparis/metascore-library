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
  <div class="control color" :data-property="property">
    <label v-if="label">{{ label }}</label>
    <tippy
      trigger="click"
      role="dialog"
      content-tag="div"
      content-class="overlay"
      append-to="parent"
      placement="bottom"
      sticky="reference"
      max-width="none"
      :interactive="true"
      :popper-options="{ strategy: 'fixed' }"
    >
      <button class="opener"></button>
      <template #content="{ hide }">
        <tabs-container>
          <tabs-item v-if="picker" title="Picker">
            <color-picker :value="css" @change="onPickerChange" />
          </tabs-item>
          <tabs-item v-if="swatches" title="Swatches">
            <color-swatches
              v-bind="isArray(swatches) ? { swatches } : null"
              :value="css"
              @change="onSwatchesChange"
            />
          </tabs-item>
        </tabs-container>
        <div class="buttons">
          <button class="apply" @click="apply">
            <span class="label">{{ $t("apply_button") }}</span>
          </button>
          <button class="cancel" @click="hide">
            <span class="label">{{ $t("cancel_button") }}</span>
          </button>
        </div>
      </template>
    </tippy>
  </div>
</template>

<script>
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
    property: {
      type: String,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
    },
    value: {
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
  emits: ["change"],
  data() {
    return {
      css: null,
    };
  },
  methods: {
    isArray,
    onChange(evt) {
      this.$emit("change", {
        property: this.property,
        value: evt.target.value,
      });
    },
    onPickerChange(css) {
      this.css = css;
    },
    onSwatchesChange(css) {
      this.css = css;
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
        padding: 0.25em 0.5em;
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
