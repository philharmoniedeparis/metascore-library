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

    <div ref="wrapper" class="keyframes-wrapper" @click="onWrapperClick">
      <div
        v-for="(keyframe, index) in modelValue"
        :key="index"
        :style="{
          left: `${(keyframe[0] / mediaDuration) * 100}%`,
        }"
        :title="`${keyframe[1]} @ ${formatTime(keyframe[0])}`"
        :class="['keyframe', { selected: selectedIndex === index }]"
        tabindex="0"
        @click.stop="onKeyframeClick(keyframe)"
      />
    </div>
  </div>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/drop";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
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
      selectedIndex: null,
    };
  },
  computed: {
    mediaTime: {
      get() {
        return this.mediaStore.time;
      },
      set(value) {
        this.mediaStore.seekTo(value);
      },
    },
    mediaDuration() {
      return this.mediaStore.duration;
    },
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit(
          "update:modelValue",
          value.sort((a, b) => {
            return a[0] - b[0];
          })
        );
      },
    },
    selectedKeyframe() {
      return this.selectedIndex !== null
        ? this.value[this.selectedIndex]
        : null;
    },
    hotkeys() {
      return {
        delete: this.deleteSelectedKeyframe,
        backspace: this.deleteSelectedKeyframe,
      };
    },
  },
  mounted() {
    this._interactable = interact(".keyframe.selected").draggable({
      context: this.$el,
      startAxis: "x",
      lockAxis: "x",
      listeners: {
        move: this.onKeyframeDraggableMove,
        end: this.onKeyframeDraggableEnd,
      },
    });
  },
  beforeUnmount() {
    if (this._interactable) {
      this._interactable.unset();
      delete this._interactable;
    }
  },
  methods: {
    formatTime,
    onWrapperClick(evt) {
      const { width, left } = evt.target.getBoundingClientRect();
      const x = evt.pageX - left;
      const time = round((x / width) * this.mediaDuration, 2);
      const value = getAnimatedValueAtTime(this.value, time);

      const keyframe = [time, value];
      this.value = [...this.value, keyframe];

      this.selectKeyframe(keyframe);
      this.mediaTime = keyframe[0];
    },
    onKeyframeClick(keyframe) {
      this.selectKeyframe(keyframe);
      this.mediaTime = keyframe[0];
    },
    onKeyframeDraggableMove(evt) {
      const { width } = this.$refs.wrapper.getBoundingClientRect();
      const delta_x = evt.delta.x;
      const delta_time = (delta_x / width) * this.mediaDuration;
      const keyframe = [
        round(this.selectedKeyframe[0] + delta_time, 2),
        this.selectedKeyframe[1],
      ];

      this.value = [
        ...this.value.slice(0, this.selectedIndex),
        ...this.value.slice(this.selectedIndex + 1),
        keyframe,
      ];

      this.selectKeyframe(keyframe);
    },
    onKeyframeDraggableEnd() {
      this.mediaTime = this.selectedKeyframe[0];
    },
    selectKeyframe(keyframe) {
      this.$nextTick(function () {
        this.selectedIndex = this.value.findIndex(
          (k) => k[0] === keyframe[0] && k[1] === keyframe[1]
        );
      });
    },
    deleteSelectedKeyframe() {
      if (this.selectedKeyframe !== null) {
        this.value = this.value.filter(
          (k) =>
            !(
              k[0] === this.selectedKeyframe[0] &&
              k[1] === this.selectedKeyframe[1]
            )
        );
        this.selectedIndex = null;
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
    cursor: copy;
  }

  .keyframe {
    display: flex;
    position: absolute;
    top: 0;
    width: 2em;
    height: 2em;
    margin-left: -1em;
    padding: 0.6em;
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
