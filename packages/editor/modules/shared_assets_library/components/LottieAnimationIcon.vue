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
  mounted() {
    this.$nextTick(async function () {
      if (!this.src) {
        return;
      }

      const { default: Lottie } = await import(
        /* webpackChunkName: "vendors.lottie.js" */
        /* webpackExports: ["default"] */
        "lottie-web"
      );

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
    if (this._intersection_observer) {
      this._intersection_observer.disconnect();
      delete this._intersection_observer;
    }

    if (this.animation) {
      this.animation.removeEventListener("DOMLoaded", this.onAnimationLoaded);
      this.animation.destroy();
    }
  },
  methods: {
    onAnimationLoaded() {
      this.loaded = true;

      this._intersection_observer = new IntersectionObserver(
        this.onIntersectionChange,
        { threshold: 0.5 }
      );
      this._intersection_observer.observe(this.$el);
    },
    onIntersectionChange(entries) {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      this.animation[entry.isIntersecting ? "play" : "stop"]();
    },
  },
};
</script>
