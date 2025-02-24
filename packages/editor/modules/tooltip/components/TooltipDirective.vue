<template>
  <Transition>
    <div v-show="!hidden" class="tooltip" :style="style">
      {{ content }}
    </div>
  </Transition>
</template>

<script>
import { unref } from "vue";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";

export default {
  props: {
    target: {
      type: HTMLElement,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    placement: {
      type: String,
      default: "top-start",
    },
    delay: {
      type: Number,
      default: 1000,
    },
    movementThreashhold: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      hidden: true,
      targetX: null,
      targetY: null,
      style: null,
      timeoutId: null,
    };
  },
  mounted() {
    this.target.addEventListener("mouseenter", this.onTargetMouseenter);
    this.target.addEventListener("mousemove", this.onTargetMousemove);
    this.target.addEventListener("mouseleave", this.onTargetMouseleave);
  },
  beforeUnmount() {
    this.target.removeEventListener("mouseenter", this.onTargetMouseenter);
    this.target.removeEventListener("mousemove", this.onTargetMousemove);
    this.target.removeEventListener("mouseleave", this.onTargetMouseleave);
  },
  methods: {
    async onTargetMouseenter({ clientX, clientY }) {
      this.targetX = clientX;
      this.targetY = clientY;

      if (this.delay > 0) {
        await new Promise((resolve) => {
          this.timeoutId = setTimeout(resolve, this.delay);
        });
      }

      await this.show();
    },
    onTargetMousemove({ clientX, clientY }) {
      if (this.hidden) {
        // The delay in mouseenter is not over,
        // update the target position.
        this.targetX = clientX;
        this.targetY = clientY;
        return;
      }

      if (this.movementThreashhold) {
        // Hide if the mouse moved a distance greater than the threashhold.
        const distance = Math.sqrt(
          (clientX - this.targetX) * (clientX - this.targetX) +
          (clientY - this.targetY) * (clientY - this.targetY)
        );
        if (distance > this.movementThreashhold) this.hide();
      }
    },
    onTargetMouseleave() {
      if (this.timeoutId) clearTimeout(this.timeoutId);

      this.hide();
    },
    async show() {
      this.hidden = false;

      await this.$nextTick();

      const targetX = unref(this.targetX);
      const targetY = unref(this.targetY);

      const target = {
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: targetX,
            y: targetY,
            top: targetY,
            left: targetX,
            right: targetX,
            bottom: targetY,
          };
        },
      };

      const options = {
        strategy: "fixed",
        placement: this.placement,
        middleware: [offset(10), flip(), shift()],
      };

      const { x, y } = await computePosition(target, this.$el, options);

      this.style = {
        left: `${x}px`,
        top: `${y}px`,
      };
    },
    hide() {
      this.hidden = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.tooltip {
  position: fixed;
  padding: 0 0.2em;
  background: var(--metascore-color-bg-tertiary);
  color: var(--metascore-color-text-primary);
  border: 1px solid var(--metascore-color-bg-primary);
  border-radius: 0.25em;
  opacity: 1;
  transition: opacity 0.5s ease;
  text-wrap: nowrap;
  pointer-events: none;
  z-index: 999999;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
