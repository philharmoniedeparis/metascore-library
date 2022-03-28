<template>
  <div class="cursor-keyframes-editor" @click.stop="onClick">
    <div
      v-for="(keyframe, index) in value"
      :key="index"
      class="keyframe"
      :style="{ left: `${keyframe[1]}px` }"
      @click.stop
    >
      <floating-vue
        popper-class="overlay"
        placement="top-start"
        :triggers="['hover', 'click']"
        :delay="{ show: 0, hide: 100 }"
        :container="false"
        :handle-resize="false"
        :prevent-overflow="false"
        :distance="0"
      >
        <div class="marker" :data-index="index"></div>

        <template #popper>
          <div class="overlay--inner">
            <div class="time" @click.stop>
              {{ formatTime(keyframe[0]) }}
            </div>
            <styled-button type="button" @click.stop="deleteKeyframe(index)">
              <template #icon><clear-icon /></template>
            </styled-button>
          </div>
        </template>
      </floating-vue>
    </div>
  </div>
</template>

<script>
import { round } from "lodash";
import { Menu as FloatingVue } from "floating-vue";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/modifiers";
import "@interactjs/pointer-events";
import interact from "@interactjs/interact";
import { useModule } from "@metascore-library/core/services/module-manager";
import { formatTime } from "@metascore-library/core/utils/media";
import ClearIcon from "../assets/icons/clear.svg?inline";
import "@metascore-library/editor/scss/_floating-vue.scss";

export default {
  components: {
    FloatingVue,
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
    const StyledButton = useModule("styled_button").StyledButton;
    const mediaStore = useModule("media").useStore();
    return { StyledButton, mediaStore };
  },
  data() {
    return {
      hoveredKeyframe: null,
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        if (!this.lazy) {
          this.$emit("update:modelValue", value);
        }
      },
    },
    mediaTime() {
      return this.mediaStore.time;
    },
  },
  mounted() {
    this._interactable = interact(".keyframe .marker", {
      context: this.$el,
    }).draggable({
      listeners: {
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
    formatTime,
    onClick(evt) {
      const { x } = this.$el.getBoundingClientRect();
      const { clientX } = evt;
      this.addKeyframe(this.mediaTime, clientX - x);
    },
    onDraggableMove(evt) {
      const index = parseInt(evt.target.dataset.index);
      const keyframe = this.value[index];
      keyframe[1] += evt.delta.x;
    },
    onDraggableEnd(evt) {
      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    addKeyframe(time, position) {
      const keyframe = [round(time, 2), Math.round(position)];
      this.value.push(keyframe);
      this.value = this.value.sort((a, b) => {
        return a[1] - b[1];
      });
    },
    deleteKeyframe(index) {
      this.value.splice(index, 1);
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
      width: 1px;
      height: 100%;
      padding: 0 2px;
      margin-left: -2px;

      &::after {
        content: "";
        display: block;
        height: 100%;
        background: $metascore-color;
      }
    }

    &:hover {
      .marker {
        &::after {
          box-shadow: 0 0 0.25em 0 $metascore-color;
        }
      }
    }
  }

  ::v-deep(.overlay) {
    .v-popper__inner {
      background: none;
      border: none;
      border-radius: 0;
      box-shadow: none;
      cursor: default;
    }

    .v-popper__arrow-container {
      display: none;
    }

    .time {
      font-size: 0.9em;
      padding: 0.25em 0.5em;
      color: $white;
      background: $metascore-color;
    }

    // #\9 is used here to increase specificity.
    button:not(#\9) {
      padding: 0.25em;
      color: $white;
      background: $danger;

      .icon {
        display: block;
        width: 1em;
        height: 1em;
      }
    }
  }
}
</style>
