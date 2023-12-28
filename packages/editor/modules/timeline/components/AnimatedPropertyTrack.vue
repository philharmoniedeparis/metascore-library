<i18n>
{
  "fr": {
    "opacity": "Opacité",
    "scale": "Échelle",
    "translate": "Translation",
    "rotate": "Rotation",
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
    "rotate": "Rotation",
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
    v-hotkey.local.prevent="hotkeys"
    :class="['animated-property-track', { dragging }]"
    :data-property="property"
  >
    <div ref="handle" class="handle">
      <animated-icon class="icon" />
      <div class="label">{{ $t(property) || property }}</div>
    </div>

    <div ref="wrapper" class="keyframes-wrapper" @click="onWrapperClick">
      <div
        v-for="(keyframe, index) in value"
        :key="index"
        :style="{ left: `${(keyframe[0] / mediaDuration) * 100}%` }"
        :title="`${keyframe[1]} @ ${formatTime(keyframe[0])}`"
        :class="['keyframe', { selected: selected === index }]"
        tabindex="0"
        @click.stop="onKeyframeClick(index)"
        @contextmenu="onKeyframeContextmenu(index)"
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
    const {
      duration: mediaDuration,
      seekTo: seekMediaTo,
      formatTime,
    } = useModule("media_player");
    const { getAnimatedValueAtTime } = useModule("app_components");
    const { addItem: addContextmenuItem } = useModule("contextmenu");
    return {
      mediaDuration,
      seekMediaTo,
      formatTime,
      getAnimatedValueAtTime,
      addContextmenuItem,
    };
  },
  data() {
    return {
      selected: null,
      dragging: false,
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
            handler: (evt) => {
              evt.stopPropagation();

              if (evt.repeat) return;

              this.deleteSelectedKeyframe();
            },
            description: this.$t("hotkey.delete"),
          },
          backspace: {
            handler: (evt) => {
              evt.stopPropagation();

              if (evt.repeat) return;

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
        start: this.onKeyframeDraggableStart,
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
    deleteSelectedKeyframe() {
      if (this.selected !== null) {
        this.value = this.value.toSpliced(this.selected, 1);
        this.selected = null;
      }
    },
    onWrapperClick(evt) {
      const { width, left } = evt.target.getBoundingClientRect();
      const x = evt.pageX - left;
      const time = round((x / width) * this.mediaDuration, 2);
      const value = round(this.getAnimatedValueAtTime(this.value, time), 2);
      const keyframe = [time, value];

      this.selected = this.value.length;
      this.value = this.value.concat([keyframe]);

      this.seekMediaTo(time);
    },
    onKeyframeClick(index) {
      const keyframe = this.value.at(index);
      this.selected = index;
      this.seekMediaTo(keyframe[0]);
    },
    onKeyframeContextmenu(index) {
      this.addContextmenuItem({
        label: this.$t("contextmenu.keyframe.delete"),
        handler: () => {
          this.value = this.value.toSpliced(index, 1);

          if (this.selected === index) {
            this.selected = null;
          }
        },
      });
    },
    onKeyframeDraggableStart() {
      this.dragging = true;
    },
    onKeyframeDraggableMove(evt) {
      const { width } = this.$refs.wrapper.getBoundingClientRect();
      const delta_x = evt.delta.x;
      const delta_time = (delta_x / width) * this.mediaDuration;

      let [time, value] = this.value.at(this.selected);
      time = round(time + delta_time, 2);

      this.value = this.value.toSpliced(this.selected, 1, [time, value]);
      this.seekMediaTo(time);
    },
    onKeyframeDraggableEnd(evt) {
      this.dragging = false;

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.animated-property-track {
  display: contents;

  .handle {
    .icon {
      display: block;
    }
  }

  .keyframes-wrapper {
    position: relative;
    background: var(--metascore-color-bg-secondary);
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
      background: var(--metascore-color-white);
      transform: rotate(45deg);
      transform-origin: center;
    }

    &:hover {
      opacity: 1;
    }

    &.selected {
      opacity: 1;
      z-index: 1;

      &::after {
        background: #ffd800;
      }
    }
  }
}
</style>
