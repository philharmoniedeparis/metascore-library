<template>
  <teleport :to="target" :disabled="!target">
    <div ref="root" class="element-highlighter">
      <div class="overlay" :style="overlayStyle" @click="$emit('click')"></div>
      <div class="highlight" :style="highlightStyle"></div>
    </div>
  </teleport>
</template>

<script>
import { debounce } from "lodash";

export default {
  props: {
    target: {
      type: [String, HTMLElement, Boolean],
      default: "body",
    },
    el: {
      type: HTMLElement,
      default: null,
    },
    overlayOpacity: {
      type: Number,
      default: 0.75,
    },
    allowInteraction: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click"],
  data() {
    return {
      overlayStyle: null,
      highlightStyle: null,
    };
  },
  watch: {
    el(value, oldValue) {
      if (oldValue && this._resize_observer) {
        this._resize_observer.unobserve(oldValue);
      }

      if (value) {
        if (!this._resize_observer) {
          this._resize_observer = new ResizeObserver(() => {
            this.updateStyles();
          });
        }
        this._resize_observer.observe(value);

        this.updateStyles();
      }
    },
  },
  created() {
    this.onWindowResize = debounce(() => {
      this.updateStyles();
    }, 100);
  },
  mounted() {
    this.$nextTick(function () {
      window.addEventListener("resize", this.onWindowResize);
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  },
  methods: {
    updateStyles() {
      if (!this.el) {
        this.highlightStyle = null;
        this.overlayStyle = null;
        return;
      }

      const rect = this.el.getBoundingClientRect();
      const offset = this.$refs.root.getBoundingClientRect();

      const top = rect.top - offset.top;
      const left = rect.left - offset.left;
      const width = rect.width;
      const height = rect.height;

      this.highlightStyle = {
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        boxShadow: `0 0 1px 2px rgba(0, 0, 0, 0.8), rgba(0, 0, 0, ${this.overlayOpacity}) 0 0 0 5000px`,
      };

      if (this.allowInteraction) {
        const clip_path = [
          /* points of the outer rect going anticlockwise */
          "0 0",
          "100% 0",
          "100% 100%",
          "0 100%",
          /* return to the first point of the outer rect */
          "0 0",
          /* points of the inner rect going clockwise */
          `${left}px ${top}px`,
          `${left}px ${top + height}px `,
          `${left + width}px ${top + height}px `,
          `${left + width}px ${top}px`,
          /* return to the first point of the inner rect */
          `${left}px ${top}px`,
        ];
        this.overlayStyle = {
          clipPath: `polygon(${clip_path.join(",")})`,
        };
      } else {
        this.highlightStyle["pointerEvents"] = "auto";
        this.overlayStyle = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.element-highlighter {
  position: absolute;
  inset: 0px;
  pointer-events: none;

  .overlay {
    position: absolute;
    inset: 0px;
    z-index: 999997;
    opacity: 0;
    cursor: pointer;
    box-sizing: content-box;
    pointer-events: auto;
  }

  .highlight {
    position: absolute;
    z-index: 999998;
    opacity: 1;
    border-radius: 4px;
    transition: all 0.3s ease-out;
    box-sizing: content-box;
  }
}
</style>
