<i18n>
{
  "en": {
    "hexa_button": "HEXA",
    "rgba_button": "RGBA",
    "apply_button": "Appliquer",
    "cancel_button": "Cancel",
  },
  "fr": {
    "hexa_button": "HEXA",
    "rgba_button": "RGBA",
    "apply_button": "Appliquer",
    "cancel_button": "Annuler",
  },
}
</i18n>

<template>
  <div class="control color" :data-property="property">
    <label v-if="label">{{ label }}</label>
    <button class="opener" @click="onOpenerClick"></button>
    <keep-alive>
      <div v-if="open" class="overlay">
        <tabs-container>
          <tabs-item v-if="picker" title="Picker">
            <color-picker @change="onPickerChange" />
          </tabs-item>
          <tabs-item v-if="swatches.length > 0" title="Swatches">
            <color-swatches :swatches="swatches" @select="onSwatchesSelect" />
          </tabs-item>
        </tabs-container>
        <div class="format">
          <input ref="text" type="text" />
          <button
            :class="['hexa', { selected: format == 'hex' }]"
            type="button"
            @click="format = 'hex'"
          >
            <span class="label">{{ $t("hexa_button") }}</span>
          </button>
          <button
            :class="['rgba', { selected: format == 'rgba' }]"
            type="button"
            @click="format = 'rgba'"
          >
            <span class="label">{{ $t("rgba_button") }}</span>
          </button>
        </div>
        <div class="buttons">
          <button class="apply">
            <span class="label">{{ $t("apply_button") }}</span>
          </button>
          <button class="cancel">
            <span class="label">{{ $t("cancel_button") }}</span>
          </button>
        </div>
      </div>
    </keep-alive>
  </div>
</template>

<script>
import ColorPicker from "./color/ColorPicker.vue";
import ColorSwatches from "./color/ColorSwatches.vue";
import { hsv2rgb, rgb2hex, rgba2hex } from "../../../../../utils/color";

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
      type: Array,
      default() {
        return ["#fff", "#000"];
      },
    },
  },
  emits: ["change"],
  data() {
    return {
      open: false,
      format: "hex",
    };
  },
  methods: {
    onChange(evt) {
      this.$emit("change", {
        property: this.property,
        value: evt.target.value,
      });
    },
    onOpenerClick() {
      this.open = !this.open;
    },
    onPickerChange({ hsv, alpha }) {
      const rgb = hsv2rgb(hsv.h, hsv.s, hsv.v);
      this.updateText({
        ...rgb,
        a: alpha,
      });
    },
    onSwatchesSelect() {},
    updateText({ r, g, b, a }) {
      switch (this.format) {
        case "rgba":
          this.$refs.text.value =
            a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
          break;

        default:
          this.$refs.text.value =
            a < 1 ? rgba2hex(r, g, b, a) : rgb2hex(r, g, b);
      }
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

  .overlay {
    position: fixed;
    width: 20em;
    background: $lightgray;
    box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.5);
    z-index: 999;

    .format {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      padding: 0.5em 0.75em;
    }

    .buttons {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      padding: 0.5em 0.75em;

      button {
        margin: 0 0.25em;
        padding: 0.25em 0.5em;
        color: $white;
        background: $lightgray;
      }
    }
  }
}
</style>
