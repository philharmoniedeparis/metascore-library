<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="animation">
    <div ref="animation-wrapper" />
  </component-wrapper>
</template>

<script>
import { mapState } from "vuex";
import ComponentWrapper from "../ComponentWrapper.vue";
import Lottie from "lottie-web";

export default {
  components: {
    ComponentWrapper,
  },
  props: {
    /**
     * The associated vuex-orm model
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
  data() {
    return {
      loaded: false,
      animation: null,
      playing: false,
    };
  },
  computed: {
    ...mapState("media", {
      mediaReady: "ready",
      mediaTime: "time",
    }),
    startTime() {
      return this.model["start-time"] || 0;
    },
    endTime() {
      return this.model["end-time"];
    },
    src() {
      return this.model.src;
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
    startTime() {
      this.update();
    },
    endTime() {
      this.update();
    },
    src() {
      this.setupAdnimation();
    },
    startFrame() {
      this.update();
    },
    loopDuration() {
      this.updateSpeed();
      this.update();
    },
    reversed() {
      this.update();
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
  methods: {
    setupAdnimation() {
      this.loaded = false;

      if (!this.model.src) {
        return;
      }

      this.animation = Lottie.loadAnimation({
        container: this.$refs["animation-wrapper"],
        path: this.model.src,
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
  },
};
</script>

<style lang="scss" scoped></style>
