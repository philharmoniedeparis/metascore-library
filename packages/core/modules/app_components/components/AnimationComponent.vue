<template>
  <component-wrapper :component="component">
    <div ref="animation-wrapper" class="animation-wrapper" :style="style" />
  </component-wrapper>
</template>

<script lang="ts">
import { defineComponent, toRef } from "vue";
import useStore from "../store";
import { useModule } from "@core/services/module-manager";
import useTime from "../composables/useTime";

export default defineComponent ({
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
  setup(props) {
    const store = useStore();
    const component = toRef(props, "component");
    const model = store.getModelByType(component.value.type);

    const { ready: mediaReady, time: mediaTime } = useModule("media_player");
    return {
      mediaReady,
      mediaTime,
      ...useTime(component, model),
    };
  },
  data() {
    return {
      loaded: false,
      animation: null,
      duration: 0,
      totalFrames: 0,
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
        : this.duration;
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
    startTime() {
      this.update();
    },
    endTime() {
      this.update();
    },
    startFrame() {
      this.update();
    },
    reversed() {
      this.update();
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
      if (!this.loaded || !this.active) return;

      this.animation.goToAndStop(this.getCurrentFrame(), true);
    },
    async setupAdnimation() {
      this.loaded = false;

      if (!this.src) return;

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
      this.duration = this.animation.getDuration();
      this.totalFrames = this.animation.getDuration(true);

      this.updateSpeed();
    },
    updateSpeed() {
      if (!this.loaded) return;

      this.animation.setSpeed(this.duration / this.loopDuration);
    },
    getCurrentFrame() {
      if (!this.loaded) return null;

      const time = this.mediaTime - this.startTime;
      const fps = this.totalFrames / this.loopDuration;
      const frame = (time * fps + (this.startFrame - 1)) % this.totalFrames;

      return this.reversed ? this.totalFrames - frame : frame;
    },
  },
});
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
