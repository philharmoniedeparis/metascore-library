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
    resizable: {
      type: [Boolean, Object],
      default: false,
    },
    direction: {
      type: String,
      default: "horizontal",
      validator(value) {
        return ["horizontal", "vertical"].includes(value);
      },
    },
  },
  mounted() {
    if (this.resizable) {
      this._interactable = interact(this.$el).resizable({
        ...this.resizable,
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
      Object.assign(evt.target.style, {
        width: `${evt.rect.width}px`,
        height: `${evt.rect.height}px`,
      });
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
