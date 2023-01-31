<template>
  <div class="timeline" tabindex="0">
    <div class="tracks-container">
      <template v-for="scenario in scenarios" :key="scenario.id">
        <component-track
          v-if="scenario.id === activeScenario"
          :component="scenario"
        />
      </template>

      <div class="playhead" :style="playheadStyle"></div>

      <snap-guides />
    </div>
  </div>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/drop";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { useModule } from "@metascore-library/core/services/module-manager";
import ComponentTrack from "./ComponentTrack.vue";
import SnapGuides from "./SnapGuides.vue";

export default {
  components: {
    ComponentTrack,
    SnapGuides,
  },
  props: {
    scale: {
      type: Number,
      default: 1,
    },
    offset: {
      type: Number,
      default: 0,
    },
    playheadWidth: {
      type: Number,
      default: 2,
    },
    playheadColor: {
      type: String,
      default: "#0000fe",
    },
  },
  setup() {
    const {
      getComponentsByType,
      getComponent,
      activeScenario,
      updateComponent,
    } = useModule("app_components");
    const { time: mediaTime, duration: mediaDuration } =
      useModule("media_player");
    return {
      mediaTime,
      mediaDuration,
      getComponentsByType,
      getComponent,
      activeScenario,
      updateComponent,
    };
  },
  data() {
    return {
      sorted: false,
    };
  },
  computed: {
    scenarios() {
      return this.getComponentsByType("Scenario");
    },
    trackTimeWidth() {
      return `${this.scale * 100}%`;
    },
    trackTimeOffset() {
      return `${-this.offset * this.scale * 100}%`;
    },
    playheadPosition() {
      return this.mediaDuration
        ? (this.mediaTime / this.mediaDuration) * this.scale * 100
        : null;
    },
    playheadStyle() {
      return {
        borderRight: `${this.playheadWidth}px solid ${this.playheadColor}`,
        left: `${this.playheadPosition}%`,
        marginRight: `-${this.playheadWidth / 2}px`,
      };
    },
  },
  mounted() {
    this._interactable = interact(
      ".component-track:not([data-type='Scenario'], [data-type='Page']) > .handle",
      { context: this.$el }
    )
      .draggable({
        startAxis: "y",
        lockAxis: "y",
        modifiers: [
          interact.modifiers.restrict({
            restriction: ".children",
          }),
        ],
        listeners: {
          start: this.onHandleDraggableStart,
          move: this.onHandleDraggableMove,
          end: this.onHandleDraggableEnd,
        },
      })
      .dropzone({
        checker: this.handleDropzoneChecker,
        listeners: {
          dropmove: this.onHandleDropzoneDropmove,
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
    onHandleDraggableStart(evt) {
      const { target: handle } = evt;
      const track = handle.parentNode;

      track.classList.add("dragging");
      handle.dataset.dragY = 0;
    },
    onHandleDraggableMove(evt) {
      const { target: handle, dy } = evt;
      const y = parseFloat(handle.dataset.dragY) + dy;

      handle.dataset.dragY = y;
      handle.style.transform = `translateY(${y}px)`;
    },
    async onHandleDraggableEnd(evt) {
      const { target: handle } = evt;
      const track = handle.parentNode;

      track.classList.remove("dragging");
      handle.removeAttribute("data-drag-y");
      handle.style.transform = null;

      if (this.sorted) {
        const parent_track = track.parentNode.closest(".component-track");
        const parent_type = parent_track.dataset.type;
        const parent_id = parent_track.dataset.id;
        const parent = this.getComponent(parent_type, parent_id);

        const children = [];
        parent_track
          .querySelectorAll(":scope > .children > .component-track")
          .forEach((child) => {
            children.unshift({
              type: child.dataset.type,
              id: child.dataset.id,
            });
          });

        await this.updateComponent(parent, { children });

        this.sorted = false;
      }
    },
    handleDropzoneChecker(
      dragEvent,
      event,
      dropped,
      dropzone,
      dropElement,
      draggable,
      draggableElement
    ) {
      const drag_track = draggableElement.parentNode;
      const drop_track = dropElement.parentNode;

      // Only allow on siblings.
      if (
        !(
          drag_track.previousElementSibling === drop_track ||
          drag_track.nextElementSibling === drop_track
        )
      ) {
        return false;
      }

      // Only allow if draggable overlaps dropzone by 0.25%
      const dragRect = draggable.getRect(draggableElement);
      const dropRect = dropzone.getRect(dropElement);

      const overlapHeight = Math.max(
        0,
        Math.min(dropRect.bottom, dragRect.bottom) -
          Math.max(dropRect.top, dragRect.top)
      );

      const overlapRatio = overlapHeight / dragRect.height;

      return overlapRatio >= 0.25;
    },
    onHandleDropzoneDropmove(evt) {
      const drag_hanlde = evt.dragEvent.target;
      const drag_track = drag_hanlde.parentNode;
      const { top: drag_top, bottom: drag_bottom } =
        drag_hanlde.getBoundingClientRect();
      const drag_center = drag_top + (drag_bottom - drag_top) / 2;
      const drag_y = parseFloat(drag_hanlde.dataset.dragY);

      const drop_hanlde = evt.target;
      const drop_track = drop_hanlde.parentNode;
      const { top: drop_top, bottom: drop_bottom } =
        drop_hanlde.getBoundingClientRect();
      const drop_center = drop_top + (drop_bottom - drop_top) / 2;

      // Move track position.
      const position = drag_center > drop_center ? "afterend" : "beforebegin";
      drop_track.insertAdjacentElement(position, drag_track);

      // Adjust drag y.
      const { top: new_drag_top } = drag_hanlde.getBoundingClientRect();
      const new_drag_y = drag_y - (new_drag_top - drag_top);
      drag_hanlde.dataset.dragY = new_drag_y;
      drag_hanlde.style.transform = `translateY(${new_drag_y}px)`;

      this.sorted = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../scss/variables.scss";

.timeline {
  display: flex;
  flex-direction: row;
  background: var(--metascore-color-bg-primary);
  z-index: 0;

  .tracks-container {
    display: grid;
    position: relative;
    grid-template-columns: $controller-left-width auto;
    flex: 1;

    .playhead {
      position: absolute;
      grid-area: 1/2;
      top: 0;
      left: 0;
      height: 100%;
      pointer-events: none;
    }
  }

  :deep(.component-track) {
    &.dragging {
      z-index: 20;

      > .handle,
      > .time-wrapper {
        background: var(--metascore-color-bg-primary);
      }

      .handle {
        z-index: 3;
      }

      .children {
        display: none;
      }
    }
  }

  :deep(.component-track > .time-wrapper) {
    width: v-bind(trackTimeWidth);
    margin-left: v-bind(trackTimeOffset);
  }
}
</style>
