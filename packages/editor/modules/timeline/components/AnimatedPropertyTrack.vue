<i18n>
{
  "fr": {
    "opacity": "Opacité",
    "scale": "Échelle",
    "translate": "Translation",
    "hotkey": {
      "group": "Timeline",
      "delete": "Supprimer le(s) composant(s) sélectionné(s)",
      "backspace": "Supprimer le(s) composant(s) sélectionné(s)",
    },
    "contextmenu": {
      "keyframe": {
        "delete": "Supprimer",
      },
    },
  },
  "en": {
    "opacity": "Opacity",
    "scale": "Scale",
    "translate": "Translation",
    "hotkey": {
      "group": "Timeline",
      "delete": "Delete selected component(s)",
      "backspace": "Delete selected component(s)",
    },
    "contextmenu": {
      "keyframe": {
        "delete": "Delete",
      },
    },
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
        :class="[
          'keyframe',
          {
            selected:
              selectedKeyframe?.[0] === keyframe[0] &&
              selectedKeyframe?.[1] === keyframe[1],
          },
        ]"
        tabindex="0"
        @click.stop="onKeyframeClick(keyframe)"
        @contextmenu="onKeyframeContextmenu(keyframe)"
      ></div>
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
    const { addItem: addContextmenuItem } = useModule("contextmenu");
    const {
      duration: mediaDuration,
      seekTo: seekMediaTo,
      formatTime,
    } = useModule("media_player");
    return { mediaDuration, seekMediaTo, formatTime, addContextmenuItem };
  },
  data() {
    return {
      selectedKeyframe: null,
    };
  },
  computed: {
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
        group: this.$t("hotkey.group"),
        keys: {
          delete: {
            handler: ({ repeat }) => {
              if (repeat) return;

              this.deleteSelectedKeyframe();
            },
            description: this.$t("hotkey.delete"),
          },
          backspace: {
            handler: ({ repeat }) => {
              if (repeat) return;

              this.deleteSelectedKeyframe();
            },
            description: this.$t("hotkey.backspace"),
          },
        },
      };
    },
  },
  mounted() {
    this._interactable = interact(".keyframe.selected", {
      context: this.$el,
    }).draggable({
      startAxis: "x",
      lockAxis: "x",
      listeners: {
        move: this.onKeyframeDraggableMove,
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
    onWrapperClick(evt) {
      const { width, left } = evt.target.getBoundingClientRect();
      const x = evt.pageX - left;
      const time = round((x / width) * this.mediaDuration, 2);
      const value = getAnimatedValueAtTime(this.value, time);
      const keyframe = [time, value];

      this.value = this.value.concat([keyframe]).sort((a, b) => {
        return a[0] - b[0];
      });

      this.selectedKeyframe = keyframe;

      this.seekMediaTo(time);
    },
    onKeyframeClick(keyframe) {
      this.selectedKeyframe = keyframe;
      this.seekMediaTo(keyframe[0]);
    },
    onKeyframeContextmenu(keyframe) {
      this.addContextmenuItem({
        label: this.$t("contextmenu.keyframe.delete"),
        handler: () => {
          this.deleteKeyframe(keyframe);
        },
      });
    },
    onKeyframeDraggableMove(evt) {
      const { width } = this.$refs.wrapper.getBoundingClientRect();
      const delta_x = evt.delta.x;
      const delta_time = (delta_x / width) * this.mediaDuration;
      const keyframe = [
        round(this.selectedKeyframe[0] + delta_time, 2),
        this.selectedKeyframe[1],
      ];

      this.value = this.value
        .map((k) => {
          if (
            k[0] === this.selectedKeyframe[0] &&
            k[1] === this.selectedKeyframe[1]
          ) {
            return keyframe;
          }
          return k;
        })
        .sort((a, b) => {
          return a[0] - b[0];
        });

      this.selectedKeyframe = keyframe;
    },
    deleteKeyframe(keyframe) {
      this.value = this.value.filter(
        (k) => !(k[0] === keyframe[0] && k[1] === keyframe[1])
      );

      if (
        this.selectedKeyframe &&
        keyframe[0] === this.selectedKeyframe[0] &&
        keyframe[1] === this.selectedKeyframe[1]
      ) {
        this.selectedKeyframe = null;
      }
    },
    deleteSelectedKeyframe() {
      if (this.selectedKeyframe !== null) {
        this.deleteKeyframe(this.selectedKeyframe);
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
