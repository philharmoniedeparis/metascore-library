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
  <div class="animated-property-track" :data-property="property">
    <div ref="handle" class="handle" @click="onClick">
      <animated-icon class="icon" />
      <div class="label">{{ $t(property) || property }}</div>
    </div>

    <div class="keyframes-wrapper">
      <div
        v-for="([time, value], index) in modelValue"
        :key="index"
        :style="{
          left: `${(time / mediaDuration) * 100}%`,
        }"
        :title="`${value} @ ${formatTime(time)}`"
        class="keyframe"
      />
    </div>
  </div>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";
import { formatTime } from "@metascore-library/core/utils/media";
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
  computed: {
    mediaDuration() {
      return this.mediaStore.duration;
    },
  },
  methods: {
    formatTime,
  },
};
</script>

<style lang="scss" scoped>
.animated-property-track {
  display: contents;

  .handle {
    display: flex;
    position: sticky;
    left: 0;
    grid-column: 1;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    background: $mediumgray;
    border-right: 2px solid $darkgray;
    touch-action: none;
    user-select: none;
    z-index: 2;

    > .icon {
      width: 1.5em;
      flex: 0 0 auto;
      margin: 0 0.25em;
      color: white;
    }
  }

  .keyframes-wrapper {
    position: relative;
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
  }
}
</style>
