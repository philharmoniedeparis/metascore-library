<template>
  <component-wrapper :model="model" class="animation">
    <div ref="animation-wrapper" />
  </component-wrapper>
</template>

<script>
import { useStore } from "@metascore-library/core/services/module-manager";

export default {
  props: {
    /**
     * The associated component model
     */
    model: {
      type: Object,
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
  setup() {
    const mediaStore = useStore("media");
    return { mediaStore };
  },
  data() {
    return {
      loaded: false,
      animation: null,
      playing: false,
    };
  },
  computed: {
    mediaReady() {
      return this.mediaStore.ready;
    },
    mediaTime() {
      return this.mediaStore.time;
    },
    startTime() {
      return this.model["start-time"] || 0;
    },
    endTime() {
      return this.model["end-time"];
    },
    src() {
      return this.model["animation-src"];
    },
    startFrame() {
      return this.model["start-frame"] || 1;
    },
    loopDuration() {
      return this.model["loop-duration"]
        ? this.model["loop-duration"]
        : this.getDuration();
    },
    reversed() {
      return this.model.reversed;
    },
  },
  watch: {
    mediaReady() {
      this.update();
    },
    mediaTime() {
      this.update();
    },
    model: {
      handler() {
        this.update();
      },
      deep: true,
    },
    src() {
      this.setupAdnimation();
    },
    loopDuration() {
      this.updateSpeed();
    },
    animation(newValue, oldValue) {
      if (oldValue) {
        oldValue.removeEventListener("DOMLoaded", this.onAnimationLoaded);
        oldValue.destroy();
      }
    },
    loaded(newValue) {
      if (newValue) {
        this.updateSpeed();
        this.update();
      }
    },
  },
  mounted() {
    this.setupAdnimation();
  },
  beforeUnmount() {
    if (this.animation) {
      this.animation.removeEventListener("DOMLoaded", this.onAnimationLoaded);
      this.animation.destroy();
    }
  },
  methods: {
    update() {
      if (!this.loaded) {
        return;
      }

      this.animation.goToAndStop(this.getCurrentFrame(), true);
    },
    play() {
      if (!this.loaded || this.playing) {
        return;
      }

      this.animation.play();
      this.playing = true;
    },
    stop() {
      if (!this.loaded || !this.playing) {
        return;
      }

      this.animation.stop();
      this.playing = false;
    },
    async setupAdnimation() {
      this.loaded = false;

      if (!this.src) {
        return;
      }

      const { default: Lottie } = await import(
        /* webpackChunkName: "vendors.lottie.js" */ "lottie-web"
      );

      this.animation = Lottie.loadAnimation({
        container: this.$refs["animation-wrapper"],
        path: this.src,
        renderer: this.renderer,
        loop: true,
        autoplay: false,
      });

      this.animation.addEventListener("DOMLoaded", this.onAnimationLoaded);
    },
    onAnimationLoaded() {
      this.loaded = true;
    },
    updateSpeed() {
      if (!this.loaded) {
        return;
      }

      this.animation.setSpeed(this.getDuration() / this.loopDuration);
    },
    getDuration() {
      return this.loaded ? this.animation.getDuration() : 0;
    },
    getTotalFrames() {
      return this.loaded ? this.animation.getDuration(true) : 0;
    },
    getCurrentFrame() {
      if (!this.loaded) {
        return null;
      }

      const time = this.mediaTime - this.startTime;
      const total_frames = this.getTotalFrames();
      const fps = total_frames / this.loopDuration;
      const frame = (time * fps + (this.startFrame - 1)) % total_frames;

      return this.reversed ? total_frames - frame : frame;
    },
  },
};
</script>
