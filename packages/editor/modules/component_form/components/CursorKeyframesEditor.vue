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
        placement="right-start"
        :triggers="['hover']"
        :delay="{ show: 0, hide: 250 }"
        :container="overlayTarget"
        :handle-resize="false"
        :distance="-10"
      >
        <div class="marker"></div>

        <template #popper>
          <div class="time">
            {{ formatTime(keyframe[0]) }}
          </div>
          <styled-button type="button" @click.stop="deleteKeyframe(index)">
            x
          </styled-button>
        </template>
      </floating-vue>
    </div>
  </div>
</template>

<script>
import { round } from "lodash";
import { Menu as FloatingVue } from "floating-vue";
import { useModule } from "@metascore-library/core/services/module-manager";
import { formatTime } from "@metascore-library/core/utils/media";

export default {
  components: {
    FloatingVue,
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
    const mediaStore = useModule("media").useStore();
    return { mediaStore };
  },
  data() {
    return {
      hoveredKeyframe: null,
      overlayTarget: null,
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
    this.overlayTarget = this.$el;
  },
  methods: {
    formatTime,
    onClick(evt) {
      const { x } = this.$el.getBoundingClientRect();
      const { clientX } = evt;
      this.addKeyframe(this.mediaTime, clientX - x);
    },
    addKeyframe(time, position) {
      this.value.push([round(time, 2), Math.round(position)]);
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
@import "@metascore-library/editor/scss/_floating-vue.scss";

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
      padding: 0 1em;
      margin-left: -1em;

      &::after {
        content: "";
        display: block;
        height: 100%;
        background: $metascore-color;
      }

      &:hover {
        &::after {
          box-shadow: 0 0 0.25em 0 $metascore-color;
        }
      }
    }
  }

  ::v-deep(.overlay) {
    .v-popper__inner {
      border-radius: 0;
      border: none;
      box-shadow: none;
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
  }
}
</style>
