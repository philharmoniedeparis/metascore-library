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
        : this._getDuration();
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
      this._setupAdnimation();
    },
    loopDuration() {
      this._updateSpeed();
    },
    animation(newValue, oldValue) {
      if (oldValue) {
        oldValue.removeEventListener("DOMLoaded", this._onAnimationLoaded);
        oldValue.destroy();
      }
    },
    loaded(newValue) {
      if (newValue) {
        this._updateSpeed();
        this.update();
      }
    },
  },
  mounted() {
    this._setupAdnimation();
  },
  beforeUnmount() {
    if (this.animation) {
      this.animation.removeEventListener("DOMLoaded", this._onAnimationLoaded);
      this.animation.destroy();
    }
  },
  methods: {
    update() {
      if (!this.loaded) {
        return;
      }

      this.animation.goToAndStop(this._getCurrentFrame(), true);
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
    _setupAdnimation() {
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

      this.animation.addEventListener("DOMLoaded", this._onAnimationLoaded);
    },
    _onAnimationLoaded() {
      this.loaded = true;
    },
    _updateSpeed() {
      if (!this.loaded) {
        return;
      }

      this.animation.setSpeed(this._getDuration() / this.loopDuration);
    },
    _getDuration() {
      return this.loaded ? this.animation.getDuration() : 0;
    },
    _getTotalFrames() {
      return this.loaded ? this.animation.getDuration(true) : 0;
    },
    _getCurrentFrame() {
      if (!this.loaded) {
        return null;
      }

      const time = this.mediaTime - this.startTime;
      const total_frames = this._getTotalFrames();
      const fps = total_frames / this.loopDuration;
      const frame = (time * fps + (this.startFrame - 1)) % total_frames;

      return this.reversed ? total_frames - frame : frame;
    },
  },
};
</script>

<style lang="scss" scoped></style>
