<template>
  <div class="resizable-pane" :style="style">
    <slot />
  </div>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/resize";
import interact from "@interactjs/interact";

export default {
  props: {
    top: {
      type: Boolean,
      default: false,
    },
    left: {
      type: Boolean,
      default: false,
    },
    bottom: {
      type: Boolean,
      default: false,
    },
    right: {
      type: Boolean,
      default: false,
    },
    handleHeight: {
      type: Number,
      default: 6,
    },
  },
  computed: {
    style() {
      const borderWidth = `${this.handleHeight}px`;

      return {
        borderTopWidth: this.top ? borderWidth : null,
        borderLeftWidth: this.left ? borderWidth : null,
        borderBottomWidth: this.bottom ? borderWidth : null,
        borderRightWidth: this.right ? borderWidth : null,
      };
    },
  },
  mounted() {
    if (this.top || this.left || this.bottom || this.right) {
      this._interactable = interact(this.$el).resizable({
        edges: {
          top: this.top,
          left: this.left,
          bottom: this.bottom,
          right: this.right,
        },
        margin: this.handleHeight,
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
    onResizableMove(evt) {
      if (this.left || this.right) {
        evt.target.style.width = `${evt.rect.width}px`;
      }
      if (this.top || this.bottom) {
        evt.target.style.height = `${evt.rect.height}px`;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.resizable-pane {
  position: relative;
  overflow: hidden;
  background: $lightgray;
  color: $white;
  border: 0 solid $darkgray;
  box-sizing: border-box;
}
</style>
