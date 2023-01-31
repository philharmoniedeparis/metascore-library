<template>
  <div :class="['resizable-pane', { collapsed }]" :style="style">
    <div
      v-if="top"
      ref="top-handle"
      class="resize-handle"
      data-direction="top"
      :style="{ height: `${handleHeight}px` }"
      @dblclick="onHandleDblClick('top')"
    ></div>
    <div
      v-if="right"
      ref="right-handle"
      class="resize-handle"
      data-direction="right"
      :style="{ width: `${handleHeight}px` }"
      @dblclick="onHandleDblClick('right')"
    ></div>
    <div
      v-if="bottom"
      ref="bottom-handle"
      class="resize-handle"
      data-direction="bottom"
      :style="{ height: `${handleHeight}px` }"
      @dblclick="onHandleDblClick('bottom')"
    ></div>
    <div
      v-if="left"
      ref="left-handle"
      class="resize-handle"
      data-direction="left"
      :style="{ width: `${handleHeight}px` }"
      @dblclick="onHandleDblClick('left')"
    ></div>

    <slot />
  </div>
</template>

<script>
import { isObject } from "lodash";
import "@interactjs/auto-start";
import "@interactjs/actions/resize";
import interact from "@interactjs/interact";

/**
 * @typedef {object} HandleConfig
 * @param {boolean} collapse Whether double-clicking the handle collapses the pane.
 */

export default {
  props: {
    /**
     * The top handle's config.
     * @type {boolean|HandleConfig}
     */
    top: {
      type: [Boolean, Object],
      default: false,
    },
    /**
     * The left handle's config.
     * @type {boolean|HandleConfig}
     */
    left: {
      type: [Boolean, Object],
      default: false,
    },
    /**
     * The bottom handle's config.
     * @type {boolean|HandleConfig}
     */
    bottom: {
      type: [Boolean, Object],
      default: false,
    },
    /**
     * The right handle's config.
     * @type {boolean|HandleConfig}
     */
    right: {
      type: [Boolean, Object],
      default: false,
    },
    /**
     * The resize handle's height.
     */
    handleHeight: {
      type: Number,
      default: 6,
    },
    /**
     * Whether to apply the styles automatically.
     */
    applyStyles: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:width", "update:height"],
  data() {
    return {
      collapsed: false,
    };
  },
  computed: {
    style() {
      const padding = `${this.handleHeight}px`;

      return {
        paddingTop: this.top ? padding : null,
        paddingLeft: this.left ? padding : null,
        paddingBottom: this.bottom ? padding : null,
        paddingRight: this.right ? padding : null,
      };
    },
  },
  mounted() {
    if (this.top || this.left || this.bottom || this.right) {
      this._interactable = interact(this.$el).resizable({
        edges: {
          top: this.top ? this.$refs["top-handle"] : false,
          left: this.left ? this.$refs["left-handle"] : false,
          bottom: this.bottom ? this.$refs["bottom-handle"] : false,
          right: this.right ? this.$refs["right-handle"] : false,
        },
        listeners: {
          move: this.onResizableMove,
        },
      });
    }
  },
  beforeUnmount() {
    if (this._interactable) {
      this._interactable.unset();
      delete this._interactable;
    }
  },
  methods: {
    onHandleDblClick(direction) {
      const conf = this[direction];

      if (isObject(conf) && conf.collapse === true) {
        this.collapsed = !this.collapsed;
      }
    },
    onResizableMove(evt) {
      if (this.left || this.right) {
        if (this.applyStyles) {
          evt.target.style.width = `${evt.rect.width}px`;
        }
        this.$emit("update:width", evt.rect.width);
      }
      if (this.top || this.bottom) {
        if (this.applyStyles) {
          evt.target.style.height = `${evt.rect.height}px`;
        }
        this.$emit("update:height", evt.rect.height);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.resizable-pane {
  position: relative;
  overflow: hidden;
  background: var(--metascore-color-bg-tertiary);
  color: var(--metascore-color-white);
  box-sizing: border-box;

  .resize-handle {
    position: absolute;
    background: var(--metascore-color-bg-primary);

    &[data-direction="top"] {
      top: 0;
      left: 0;
      width: 100%;
    }
    &[data-direction="right"] {
      top: 0;
      right: 0;
      height: 100%;
    }
    &[data-direction="bottom"] {
      bottom: 0;
      left: 0;
      width: 100%;
    }
    &[data-direction="left"] {
      top: 0;
      left: 0;
      height: 100%;
    }
  }

  &.collapsed {
    user-select: none;

    > :not(.resize-handle) {
      display: none;
    }

    &.top,
    &.bottom {
      height: auto !important;
      min-height: 0 !important;
    }

    &.right,
    &.left {
      width: auto !important;
      min-width: 0 !important;
    }
  }
}
</style>
