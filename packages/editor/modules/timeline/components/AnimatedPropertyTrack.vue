<i18n>
{
  "fr": {
    "opacity": "Opacité",
    "scale": "Échelle",
    "translate": "Translation",
  },
  "en": {
    "opacity": "Opacity",
    "scale": "Scale",
    "translate": "Translation",
  },
}
</i18n>

<template>
  <div
    v-hotkey="hotkeys"
    class="animated-property-track"
    :data-property="property"
  >
    <div ref="handle" class="handle">
      <animated-icon class="icon" />
      <div class="label">{{ $t(property) || property }}</div>
    </div>

    <div class="keyframes-wrapper" @click="onWrapperClick">
      <div
        v-for="([time], index) in modelValue"
        :key="index"
        :style="{
          left: `${(time / mediaDuration) * 100}%`,
        }"
        :title="`${value} @ ${formatTime(time)}`"
        :class="['keyframe', { selected: time === selected }]"
        tabindex="0"
        @click.stop="onKeyframeClick(time)"
      />
    </div>
  </div>
</template>

<script>
import { round } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import { formatTime } from "@metascore-library/core/utils/media";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";
import AnimatedIcon from "../assets/icons/animated.svg?inline";

export default {
  components: {
    AnimatedIcon,
  },
  props: {
    property: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const mediaStore = useModule("media").useStore();
    return { mediaStore };
  },
  data() {
    return {
      selected: null,
    };
  },
  computed: {
    mediaTime() {
      return this.mediaStore.time;
    },
    mediaDuration() {
      return this.mediaStore.duration;
    },
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    hotkeys() {
      return {
        delete: this.deleteSelectedKeyframe,
        backspace: this.deleteSelectedKeyframe,
      };
    },
  },
  methods: {
    formatTime,
    onWrapperClick(evt) {
      const { width, left } = evt.target.getBoundingClientRect();
      const x = evt.pageX - left;
      const time = round((x / width) * this.mediaDuration, 2);
      const value = getAnimatedValueAtTime(this.value, time);

      this.addKeyframe(time, value);
    },
    onKeyframeClick(time) {
      this.selected = time;
    },
    addKeyframe(time, value) {
      this.value = [...this.value, [time, value]].sort((a, b) => {
        return a[0] - b[0];
      });
      this.selected = time;
    },
    deleteSelectedKeyframe() {
      if (this.selected !== null) {
        this.value = this.value.filter((k) => k[0] !== this.selected);
        this.selected = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.animated-property-track {
  display: contents;

  .keyframes-wrapper {
    position: relative;
    background: $mediumgray;
  }

  .keyframe {
    display: flex;
    position: absolute;
    top: 0;
    width: 1.5em;
    height: 1.5em;
    margin-left: -0.75em;
    padding: 0.4em;
    align-content: center;
    align-items: center;
    opacity: 0.5;
    box-sizing: border-box;
    cursor: pointer;

    &::after {
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      background: $white;
      transform: rotate(45deg);
      transform-origin: center;
    }

    &:hover {
      opacity: 1;
    }

    &.selected {
      opacity: 1;

      &::after {
        background: #ffd800;
      }
    }
  }
}
</style>
