<template>
  <div class="lottie-animation-icon" />
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true,
    },
    play: {
      type: Boolean,
      default: false,
    },
    renderer: {
      type: String,
      default: "svg",
      validator(value) {
        return ["svg", "canvas", "html"].includes(value);
      },
    },
  },
  data() {
    return {
      loaded: false,
      animation: null,
    };
  },
  watch: {
    play(value) {
      if (this.loaded) {
        if (value) this.animation.play();
        else this.animation.stop();
      }
    },
  },
  mounted() {
    this.$nextTick(async function () {
      if (!this.src) {
        return;
      }

      const { default: Lottie } = await import("lottie-web");

      this.animation = Lottie.loadAnimation({
        container: this.$el,
        path: this.src,
        renderer: this.renderer,
        loop: true,
        autoplay: false,
      });

      this.animation.addEventListener("DOMLoaded", this.onAnimationLoaded);
    });
  },
  beforeUnmount() {
    if (this.animation) {
      this.animation.removeEventListener("DOMLoaded", this.onAnimationLoaded);
      this.animation.destroy();
    }
  },
  methods: {
    onAnimationLoaded() {
      this.loaded = true;

      if (this.play) {
        this.animation.play();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.lottie-animation-icon {
  :deep(svg) {
    display: block;
  }
}
</style>
