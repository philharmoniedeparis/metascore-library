<template>
  <div
    :class="['assets-library-item', { dragging }]"
    draggable="true"
    @dragstart="onDragstart"
    @dragend="onDragend"
    @mouseover="onMouseover"
    @mouseout="onMouseout"
  >
    <figure>
      <img v-if="['image', 'svg'].includes(type)" :src="file.url" />
      <component :is="`${type}-icon`" v-else :src="file.url" :play="play" />
    </figure>
    <div class="label" title="{{ label }}">{{ label }}</div>
    <div class="buttons">
      <styled-button type="button" title="Supprimer">
        <template #icon><delete-icon /></template>
      </styled-button>
    </div>
  </div>
</template>

<script>
import ImageIcon from "../assets/icons/image.svg?inline";
import AudioIcon from "../assets/icons/audio.svg?inline";
import VideoIcon from "../assets/icons/video.svg?inline";
import LottieAnimationIcon from "./LottieAnimationIcon.vue";
import DeleteIcon from "../assets/icons/delete.svg?inline";

export default {
  components: {
    ImageIcon,
    AudioIcon,
    VideoIcon,
    LottieAnimationIcon,
    DeleteIcon,
  },
  props: {
    asset: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dragging: false,
      play: false,
    };
  },
  computed: {
    label() {
      return this.asset.name;
    },
    file() {
      return this.asset.shared ? this.asset.file : this.asset;
    },
    type() {
      if (this.asset.type) {
        return this.asset.type.replace("_", "-");
      }

      const matches = /^(image|audio|video)\/.*/.exec(this.file.mimetype);
      return matches ? matches[1] : null;
    },
    dragData() {
      return JSON.stringify(this.asset);
    },
  },
  methods: {
    onDragstart(evt) {
      evt.dataTransfer.effectAllowed = "copy";
      evt.dataTransfer.setData(`metascore/asset`, this.dragData);

      this.play = false;
      this.dragging = true;
    },
    onDragend() {
      this.dragging = false;
    },
    onMouseover() {
      this.play = true;
    },
    onMouseout() {
      this.play = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.assets-library-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 2.5em;
  padding: 0.25em;
  background-color: $lightgray;
  border-top: 1px solid $mediumgray;
  border-bottom: 1px solid $mediumgray;
  box-sizing: border-box;
  cursor: grab;

  figure {
    flex: 0 0 2em;
    height: 100%;
    margin: 0 0.5em 0 0;
    color: $mediumgray;
    pointer-events: none;

    img,
    svg {
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      object-fit: contain;
    }

    .icon {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.5));
    }
  }

  .label {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }

  button {
    color: $white;
  }

  &::before {
    content: "";
    display: inline-block;
    width: 1em;
    height: 100%;
    margin-right: 0.5em;
    background: url(../assets/icons/drag-handle.svg) 50% 50% no-repeat;
    vertical-align: middle;
    opacity: 0.5;
  }

  &:hover,
  &.dragging {
    background-color: $mediumgray;

    figure {
      color: $darkgray;
    }
  }

  &.dragging {
    opacity: 0.5;
  }
}
</style>
