<template>
  <component-wrapper :component="component">
    <div ref="animation-wrapper" class="animation-wrapper" :style="style" />
  </component-wrapper>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";

export default {
  props: {
    /**
     * The associated component
     */
    component: {
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
    const { ready: mediaReady, time: mediaTime } = useModule("media_player");
    return { mediaReady, mediaTime };
  },
  data() {
    return {
      loaded: false,
      animation: null,
      playing: false,
    };
  },
  computed: {
    startTime() {
      return this.component["start-time"] || 0;
    },
    endTime() {
      return this.component["end-time"];
    },
    src() {
      return this.component.src;
    },
    startFrame() {
      return this.component["start-frame"] || 1;
    },
    loopDuration() {
      return this.component["loop-duration"]
        ? this.component["loop-duration"]
        : this.getDuration();
    },
    reversed() {
      return this.component.reversed;
    },
    colors() {
      return this.component.colors;
    },
    style() {
      return this.colors?.reduce((acc, color, index) => {
        return {
          ...acc,
          [`--color${index + 1}`]: color,
        };
      }, {});
    },
  },
  watch: {
    mediaReady() {
      this.update();
    },
    mediaTime() {
      this.update();
    },
    component: {
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

      const { default: Lottie } = await import("lottie-web");

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

<style lang="scss" scoped>
.animation {
  .animation-wrapper {
    width: 100%;
    height: 100%;

    :deep(.color1 path) {
      fill: var(--color1);
    }
    :deep(.color2 path) {
      fill: var(--color2);
    }
  }
}
</style>
