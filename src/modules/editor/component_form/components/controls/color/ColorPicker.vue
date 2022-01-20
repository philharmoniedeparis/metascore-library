<template>
  <div class="color-picker">
    <div
      ref="palette"
      class="palette"
      :style="`background: ${paletteBackground};`"
    >
      <div
        class="thumb"
        :style="`background-color: ${paletteThumbBackground}; left: ${paletteThumbLeft}; top: ${paletteThumbTop}; `"
      ></div>
    </div>
    <div
      class="preview"
      :style="`background-color: ${previewBackground};`"
    ></div>
    <div ref="hue" class="hue">
      <div
        class="thumb"
        :style="`background-color: ${hueThumbBackground}; left: ${hueThumbLeft};`"
      ></div>
    </div>
    <div ref="opacity" class="opacity">
      <div
        class="thumb"
        :style="`background-color: ${opacityThumbBackground}; left: ${opacityThumbLeft};`"
      ></div>
    </div>
  </div>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/modifiers";
import "@interactjs/pointer-events";
import interact from "@interactjs/interact";
import { isEmpty, round } from "lodash";
import { toRGBA, hsv2rgb, rgb2hsv } from "../../../../../../utils/color";

export default {
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  emits: ["change"],
  data() {
    return {
      hsv: { h: 0, s: 0, v: 0 },
      alpha: 1,
    };
  },
  computed: {
    rgb() {
      return hsv2rgb(this.hsv.h, this.hsv.s, this.hsv.v);
    },
    paletteBackground() {
      const rgb = hsv2rgb(this.hsv.h, 1, 1);

      let background =
        "linear-gradient(to top, rgb(0, 0, 0), transparent) repeat scroll 0% 0%,";
      background += `rgba(0, 0, 0, 0) linear-gradient(to left, rgb(${rgb.r},${rgb.g},${rgb.b}),`;
      background += "rgb(255, 255, 255)) repeat scroll 0% 0%";

      return background;
    },
    paletteThumbBackground() {
      return `rgb(${this.rgb.r},${this.rgb.g},${this.rgb.b})`;
    },
    paletteThumbLeft() {
      return `${this.hsv.s * 100}%`;
    },
    paletteThumbTop() {
      return `${(1 - this.hsv.v) * 100}%`;
    },
    previewBackground() {
      return `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.alpha})`;
    },
    hueThumbBackground() {
      const rgb = hsv2rgb(this.hsv.h, 1, 1);
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    },
    hueThumbLeft() {
      return `${this.hsv.h * 100}%`;
    },
    opacityThumbBackground() {
      return `rgba(0, 0, 0, ${this.alpha})`;
    },
    opacityThumbLeft() {
      return `${this.alpha * 100}%`;
    },
  },
  watch: {
    value(color) {
      if (isEmpty(color)) {
        this.hsv = { h: 0, s: 0, v: 0 };
        this.alpha = 1;
      } else {
        const rgba = toRGBA(color);
        this.hsv = rgb2hsv(rgba.r, rgba.g, rgba.b);
        this.alpha = rgba.a;
      }
    },
    hsv: {
      handler() {
        this.$emit("change", {
          hsv: this.hsv,
          alpha: this.alpha,
        });
      },
      deep: true,
    },
    alpha() {
      this.$emit("change", {
        hsv: this.hsv,
        alpha: this.alpha,
      });
    },
  },
  mounted() {
    this.$nextTick(this.setupInteractions);
  },
  beforeUnmount() {
    this.destroyInteractions();
  },
  methods: {
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
            move: this.onPaletteMove,
          },
        })
        .pointerEvents({ origin: "self" })
        .on("down", this.onPaletteMove);
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
            move: this.onHueMove,
          },
        })
        .pointerEvents({ origin: "self" })
        .on("down", this.onHueMove);
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
            move: this.onOpacityMove,
          },
        })
        .pointerEvents({ origin: "self" })
        .on("down", this.onOpacityMove);
      this._interactables.push(opacity);
    },
    onPaletteMove(evt) {
      const { width, height } = interact.getElementRect(evt.target);
      const x = evt.pageX / width;
      const y = evt.pageY / height;
      const saturation = round(x, 2);
      const value = 1 - round(y, 2);

      this.hsv.s = saturation;
      this.hsv.v = value;
    },
    onHueMove(evt) {
      const { width } = interact.getElementRect(evt.target);
      const x = evt.pageX / width;
      const hue = round(x, 2);

      this.hsv.h = hue;
    },
    onOpacityMove(evt) {
      const { width } = interact.getElementRect(evt.target);
      const x = evt.pageX / width;
      const opacity = round(x, 2);

      this.alpha = opacity;
    },
    destroyInteractions() {
      if (this._interactables) {
        this._interactables.forEach((interactable) => {
          interactable.unset();
        });

        delete this._interactables;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.color-picker {
  display: grid;
  min-width: 20em;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas: "palette palette" "preview hue" "preview opacity";

  .thumb {
    position: absolute;
    width: 1em;
    height: 1em;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    box-sizing: border-box;
    border: 2px solid $white;
    border-radius: 50%;
    box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  .palette {
    grid-area: palette;
    position: relative;
    height: 10em;
    cursor: grab;
  }

  .preview {
    grid-area: preview;
    position: relative;
    width: 2em;
    height: 2em;
    margin: 0.5em;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 0 0.25em 0 rgba(0, 0, 0, 0.5);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      @include transparency-grid;
      background-size: 1em;
      z-index: -1;
    }
  }

  .hue,
  .opacity {
    position: relative;
    height: 0.5em;
    margin: 0.5em;
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
      background: linear-gradient(90deg, transparent, $black);
    }
  }
}
</style>
