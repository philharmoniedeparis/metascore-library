<template>
  <div class="cursor-keyframes-editor" @click.stop="onClick">
    <div
      v-for="(keyframe, index) in value"
      :key="index"
      :class="['keyframe', { active: activeKeyframe === index }]"
      :style="{ left: `${keyframe[1]}px` }"
      :data-index="index"
      @mouseover="activeKeyframe = index"
      @mouseleave="activeKeyframe = null"
      @mousedown.prevent
    >
      <div class="marker"></div>

      <div
        v-show="!draggingKeyframe && activeKeyframe === index"
        class="overlay"
        :data-placement="overlayPlacement"
        :style="overlayStyle"
      >
        <div class="time" @click.stop>
          {{ ovelayLabel }}
        </div>
        <base-button type="button" @click.stop="deleteActiveKeyframe">
          <template #icon><clear-icon /></template>
        </base-button>
      </div>
    </div>
  </div>
</template>

<script>
import { round } from "lodash";
import { computePosition, flip } from "@floating-ui/dom";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/modifiers";
import "@interactjs/pointer-events";
import interact from "@interactjs/interact";
import { useModule } from "@metascore-library/core/services/module-manager";
import ClearIcon from "../../assets/icons/clear.svg?inline";

export default {
  components: {
    ClearIcon,
  },
  props: {
    modelValue: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const { time: mediaTime, formatTime } = useModule("media_player");
    return { mediaTime, formatTime };
  },
  data() {
    return {
      activeKeyframe: null,
      overlayPlacement: null,
      overlayStyle: null,
      draggingKeyframe: false,
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
    ovelayLabel() {
      if (this.activeKeyframe === null) {
        return null;
      }

      return this.formatTime(this.value[this.activeKeyframe]?.[0]);
    },
  },
  watch: {
    activeKeyframe(value) {
      if (value !== null) {
        this.$nextTick(function () {
          const keyframe = this.$el.querySelector(".keyframe.active");
          const overlay = keyframe.querySelector(".overlay");
          computePosition(keyframe, overlay, {
            placement: "right-start",
            middleware: [flip()],
          }).then(({ x, y, placement }) => {
            this.overlayPlacement = placement;
            this.overlayStyle = {
              left: `${x}px`,
              top: `${y}px`,
            };
          });
        });
      } else {
        this.overlayPlacement = null;
        this.overlayStyle = null;
      }
    },
  },
  mounted() {
    this._interactable = interact(".keyframe", {
      context: this.$el,
    }).draggable({
      listeners: {
        start: this.onDraggableStart,
        move: this.onDraggableMove,
        end: this.onDraggableEnd,
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
    onClick(evt) {
      const { x } = this.$el.getBoundingClientRect();
      const { clientX } = evt;
      this.addKeyframe(this.mediaTime, clientX - x);
    },
    onDraggableStart() {
      this.draggingKeyframe = true;
    },
    onDraggableMove(evt) {
      const index = parseInt(evt.target.dataset.index);
      const keyframe = this.value[index];
      this.value = [
        ...this.value.slice(0, index),
        [keyframe[0], keyframe[1] + evt.delta.x],
        ...this.value.slice(index + 1),
      ];
    },
    onDraggableEnd(evt) {
      this.draggingKeyframe = false;

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    addKeyframe(time, position) {
      const keyframe = [round(time, 2), Math.round(position)];
      this.value = [...this.value, keyframe].sort((a, b) => {
        return a[1] - b[1];
      });
    },
    deleteActiveKeyframe() {
      if (this.activeKeyframe === null) {
        return;
      }

      this.value = [
        ...this.value.slice(0, this.activeKeyframe),
        ...this.value.slice(this.activeKeyframe + 1),
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.cursor-keyframes-editor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: copy;

  .keyframe {
    position: absolute;
    top: 0;
    height: 100%;

    .marker {
      position: absolute;
      top: 0;
      left: -2px;
      width: 1px;
      height: 100%;
      padding: 0 2px;

      &::after {
        content: "";
        display: block;
        height: 100%;
        background: var(--metascore-color-accent);
      }
    }

    &.active {
      .marker {
        &::after {
          box-shadow: 0 0 0.25em 0 var(--metascore-color-accent);
        }
      }
    }
  }

  .overlay {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    z-index: 9999;

    .time {
      font-size: 0.9em;
      padding: 0.25em 0.5em;
      color: var(--metascore-color-white);
      background: var(--metascore-color-accent);
    }

    // #\9 is used here to increase specificity.
    button:not(#\9) {
      padding: 0.25em;
      background: var(--metascore-color-danger);

      .icon {
        display: block;
        width: 1em;
        height: 1em;
      }
    }

    &[data-placement="left-start"] {
      align-items: flex-end;
    }
  }
}
</style>
