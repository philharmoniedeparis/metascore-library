<template>
  <div class="resizable-pane">
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
        listeners: {
          move: this.onResize,
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
    onResize(evt) {
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
@import "../assets/css/theme.scss";

.resizable-pane {
  position: relative;
  overflow: hidden;
  background: $lightgray;
  color: $white;
}
</style>
