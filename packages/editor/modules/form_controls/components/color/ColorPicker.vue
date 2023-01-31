<i18n>
{
  "en": {
    "hexa_button": "HEXA",
    "rgba_button": "RGBA",
  },
  "fr": {
    "hexa_button": "HEXA",
    "rgba_button": "RGBA",
  },
}
</i18n>

<template>
  <div class="color-picker">
    <div
      ref="palette"
      class="palette"
      :style="`background: ${paletteBackground};`"
    >
      <div
        class="thumb"
        :style="`background-color: ${paletteThumbColor}; left: ${paletteThumbLeft}; top: ${paletteThumbTop}; `"
      ></div>
    </div>
    <div class="preview" :style="`color: ${previewColor};`"></div>
    <div ref="hue" class="hue">
      <div
        class="thumb"
        :style="`background-color: ${hueThumbColor}; left: ${hueThumbLeft};`"
      ></div>
    </div>
    <div ref="opacity" class="opacity">
      <div
        class="thumb"
        :style="`background-color: ${opacityThumbColor}; left: ${opacityThumbLeft};`"
      ></div>
    </div>
    <div class="format">
      <text-control ref="text" v-model="text" :lazy="true" />
      <base-button
        :class="['hexa', { selected: format == 'hexa' }]"
        type="button"
        @click="format = 'hexa'"
      >
        {{ $t("hexa_button") }}
      </base-button>
      <base-button
        :class="['rgba', { selected: format == 'rgba' }]"
        type="button"
        @click="format = 'rgba'"
      >
        {{ $t("rgba_button") }}
      </base-button>
    </div>
  </div>
</template>

<script>
import chroma from "chroma-js";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/modifiers";
import "@interactjs/pointer-events";
import interact from "@interactjs/interact";
import { round } from "lodash";
import TextControl from "../TextControl.vue";

export default {
  components: {
    TextControl,
  },
  props: {
    modelValue: {
      type: String,
      default: "#000",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      hsv: [0, 0, 0],
      alpha: 1,
      format: "hexa",
    };
  },
  computed: {
    text: {
      get() {
        return this.format === "rgba" ? this.css : this.hex;
      },
      set(value) {
        this.setColor(value);
        this.$emit("update:modelValue", this.css);
      },
    },
    chroma() {
      return chroma.hsv(...this.hsv).alpha(this.alpha);
    },
    rgb() {
      return this.chroma.rgb();
    },
    css() {
      return this.chroma.css();
    },
    hex() {
      return this.chroma.hex();
    },
    paletteBackground() {
      const [r, g, b] = chroma.hsv([this.hsv[0], 1, 1]).rgb();

      let background =
        "linear-gradient(to top, rgb(0, 0, 0), transparent) repeat scroll 0% 0%,";
      background += `rgba(0, 0, 0, 0) linear-gradient(to left, rgb(${r},${g},${b}),`;
      background += "rgb(255, 255, 255)) repeat scroll 0% 0%";

      return background;
    },
    paletteThumbColor() {
      const [r, g, b] = this.rgb;
      return `rgb(${r},${g},${b})`;
    },
    paletteThumbLeft() {
      const [, s] = this.hsv;
      return `${s * 100}%`;
    },
    paletteThumbTop() {
      const [, , v] = this.hsv;
      return `${(1 - v) * 100}%`;
    },
    previewColor() {
      const [r, g, b] = this.rgb;
      return `rgb(${r}, ${g}, ${b}, ${this.alpha})`;
    },
    hueThumbColor() {
      const [r, g, b] = chroma.hsv([this.hsv[0], 1, 1]).rgb();
      return `rgb(${r}, ${g}, ${b})`;
    },
    hueThumbLeft() {
      const [h] = this.hsv;
      return `${(h / 360) * 100}%`;
    },
    opacityThumbColor() {
      return `rgba(0, 0, 0, ${this.alpha})`;
    },
    opacityThumbLeft() {
      return `${this.alpha * 100}%`;
    },
  },
  watch: {
    modelValue(value) {
      this.setColor(value);
    },
  },
  mounted() {
    this.setColor(this.modelValue);

    this.$nextTick(function () {
      this.setupInteractions();
    });
  },
  beforeUnmount() {
    this.destroyInteractions();
  },
  methods: {
    setColor(value) {
      if (chroma.valid(value)) {
        const color = chroma(value);
        const [h, s, v] = color.hsv();
        this.hsv = [isNaN(h) ? 0 : h, s, v];
        this.alpha = color.alpha();
      }
    },
    setupInteractions() {
      this._interactables = [];

      const palette = interact(this.$refs.palette)
        .styleCursor(false)
        .draggable({
          origin: "self",
          modifiers: [
            interact.modifiers.restrict({
              restriction: "self",
            }),
          ],
          listeners: {
            move: this.onPaletteDraggableMove,
          },
        })
        .pointerEvents({ origin: "self" })
        .on("down", this.onPaletteDraggableMove);
      this._interactables.push(palette);

      const hue = interact(this.$refs.hue)
        .styleCursor(false)
        .draggable({
          origin: "self",
          modifiers: [
            interact.modifiers.restrict({
              restriction: "self",
            }),
          ],
          listeners: {
            move: this.onHueDraggableMove,
          },
        })
        .pointerEvents({ origin: "self" })
        .on("down", this.onHueDraggableMove);
      this._interactables.push(hue);

      const opacity = interact(this.$refs.opacity)
        .styleCursor(false)
        .draggable({
          origin: "self",
          modifiers: [
            interact.modifiers.restrict({
              restriction: "self",
            }),
          ],
          listeners: {
            move: this.onOpacityDraggableMove,
          },
        })
        .pointerEvents({ origin: "self" })
        .on("down", this.onOpacityDraggableMove);
      this._interactables.push(opacity);
    },
    destroyInteractions() {
      if (this._interactables) {
        this._interactables.forEach((interactable) => {
          interactable.unset();
        });

        delete this._interactables;
      }
    },
    onPaletteDraggableMove(evt) {
      const { width, height } = interact.getElementRect(evt.target);
      const x = evt.pageX / width;
      const y = evt.pageY / height;

      this.hsv[1] = round(x, 2);
      this.hsv[2] = 1 - round(y, 2);
      this.$emit("update:modelValue", this.css);
    },
    onHueDraggableMove(evt) {
      const { width } = interact.getElementRect(evt.target);
      const x = evt.pageX / width;

      this.hsv[0] = round(x * 360, 2);
      this.$emit("update:modelValue", this.css);
    },
    onOpacityDraggableMove(evt) {
      const { width } = interact.getElementRect(evt.target);
      const x = evt.pageX / width;

      this.alpha = round(x, 2);
      this.$emit("update:modelValue", this.css);
    },
  },
};
</script>

<style lang="scss" scoped>
.color-picker {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto auto auto;
  grid-template-areas: "palette palette" "preview hue" "preview opacity" "format format";

  .thumb {
    position: absolute;
    width: 1em;
    height: 1em;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    box-sizing: border-box;
    border: 2px solid var(--metascore-color-white);
    border-radius: 50%;
    box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  .palette {
    grid-area: palette;
    position: relative;
    height: 10em;
    margin-bottom: 0.5em;
    overflow: hidden;
    cursor: grab;
  }

  .preview {
    grid-area: preview;
    position: relative;
    width: 2em;
    height: 2em;
    margin: 0.5em 0.5em 0.5em 0.75em;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 0 0.25em 0 rgba(0, 0, 0, 0.5);

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    &::before {
      @include transparency-grid;
      background-size: 1em;
    }

    &::after {
      color: inherit;
      background-color: currentColor;
    }
  }

  .hue,
  .opacity {
    position: relative;
    height: 0.75em;
    margin: 0.25em 1em 0.25em 0.25em;
    border-radius: 0.5em;
    cursor: grab;
  }

  .hue {
    grid-area: hue;
    background: linear-gradient(
      90deg,
      #f00,
      #ff0,
      #0f0,
      #0ff,
      #00f,
      #f0f,
      #f00
    );
  }

  .opacity {
    grid-area: opacity;
    @include transparency-grid;
    background-size: 0.5em;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        var(--metascore-color-black)
      );
      border-radius: 0.5em;
    }
  }

  .format {
    grid-area: format;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin: 0.5em 0.75em;

    :deep(.control.text) {
      margin-right: 1em;

      input {
        width: 100%;
        border-radius: 0;
      }
    }

    button {
      padding: 0.5em;
      background: var(--metascore-color-bg-secondary);

      &.selected {
        background: var(--metascore-color-bg-primary);
      }
    }
  }
}
</style>
