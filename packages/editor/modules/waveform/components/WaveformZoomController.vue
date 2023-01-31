<template>
  <div class="waveform--zoom-controller">
    <base-button
      type="button"
      title="Zoom out"
      class="zoom-out"
      @mousedown="onZoomOutMousedown"
      @mouseup="onButtonMouseup"
    >
      <template #icon><zoom-icon /></template>
    </base-button>

    <div ref="slider" class="slider">
      <div class="thumb" :style="`left: ${sliderThumbLeft}%;`"></div>
    </div>

    <base-button
      type="button"
      title="Zoom in"
      class="zoom-in"
      @mousedown="onZoomInMousedown"
      @mouseup="onButtonMouseup"
    >
      <template #icon><zoom-icon /></template>
    </base-button>
  </div>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/modifiers";
import "@interactjs/pointer-events";
import interact from "@interactjs/interact";
import { map, clamp } from "@metascore-library/core/utils/math";
import useStore from "../store";
import ZoomIcon from "../assets/icons/zoom.svg?inline";

export default {
  components: {
    ZoomIcon,
  },
  props: {
    buttonStep: {
      type: Number,
      default: 32,
    },
    buttonInterval: {
      type: Number,
      default: 50,
    },
  },
  setup() {
    const store = useStore();
    return { store };
  },
  computed: {
    waveformScale() {
      return this.store.scale;
    },
    waveformMinScale() {
      return this.store.minScale;
    },
    waveformMaxScale() {
      return this.store.maxScale;
    },
    sliderThumbLeft() {
      return map(
        this.waveformScale,
        this.waveformMinScale,
        this.waveformMaxScale,
        100,
        0
      );
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.setupInteractions();
    });
  },
  beforeUnmount() {
    this.destroyInteractions();
  },
  methods: {
    setupInteractions() {
      this._interactable = interact(this.$refs.slider)
        .draggable({
          origin: "self",
          modifiers: [
            interact.modifiers.restrict({
              restriction: "self",
            }),
          ],
          listeners: {
            move: this.onSliderDraggableMove,
          },
        })
        .pointerEvents({ origin: "self" })
        .on("down", this.onSliderDraggableMove);
    },
    destroyInteractions() {
      if (this._interactable) {
        this._interactable.unset();
        delete this._interactable;
      }
    },
    onSliderDraggableMove(evt) {
      const { width } = interact.getElementRect(evt.target);
      const x = evt.pageX / width;

      let scale = map(x, 1, 0, this.waveformMinScale, this.waveformMaxScale);

      // Enforce the value to be a multiple of 2.
      scale = 2 * Math.floor(scale / 2);

      this.store.scale = scale;
    },
    zoomIn() {
      this.store.scale = clamp(
        this.store.scale - this.buttonStep,
        this.waveformMinScale,
        this.waveformMaxScale
      );
    },
    zoomOut() {
      this.store.scale = clamp(
        this.store.scale + this.buttonStep,
        this.waveformMinScale,
        this.waveformMaxScale
      );
    },
    onZoomInMousedown() {
      this.zoomIn();

      this._zoom_interval = setInterval(() => {
        this.zoomIn();
      }, this.buttonInterval);
    },
    onZoomOutMousedown() {
      this.zoomOut();

      this._zoom_interval = setInterval(() => {
        this.zoomOut();
      }, this.buttonInterval);
    },
    onButtonMouseup() {
      clearInterval(this._zoom_interval);
      delete this.zoom_interval;
    },
  },
};
</script>

<style lang="scss" scoped>
.waveform--zoom-controller {
  display: flex;
  width: 12em;
  flex-direction: row;
  align-items: center;
  background-color: var(--color-bg-primary);

  // #\9 is used here to increase specificity.
  button:not(#\9) {
    padding: 0 0.5em;

    &.zoom-out {
      font-size: 0.75em;
      padding-top: 0.25em;
    }
    &.zoom-in {
      font-size: 1.25em;
    }
  }

  .slider {
    position: relative;
    flex: 1;
    height: 1em;
    margin: 0 0.5em;

    .thumb {
      position: absolute;
      width: 0.75em;
      height: 0.75em;
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      background: var(--color-white);
      box-sizing: border-box;
      border-radius: 50%;
      box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.5);
      pointer-events: none;
    }

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      width: 100%;
      height: 1px;
      background: var(--color-bg-tertiary);
    }
  }
}
</style>
