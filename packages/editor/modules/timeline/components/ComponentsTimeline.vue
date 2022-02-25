<template>
  <div class="timeline" tabindex="0">
    <div class="tracks-container">
      <canvas ref="playhead" class="playhead" />
      <component-track v-if="scenario" :model="scenario" />
    </div>
  </div>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/drop";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { useStore } from "@metascore-library/core/module-manager";
import ComponentTrack from "./ComponentTrack.vue";

export default {
  components: {
    ComponentTrack,
  },
  setup() {
    const editorStore = useStore("editor");
    const mediaStore = useStore("media");
    const componentsStore = useStore("components");
    return { editorStore, mediaStore, componentsStore };
  },
  data() {
    return {
      resorted: false,
    };
  },
  computed: {
    mediaTime() {
      return this.mediaStore.time;
    },
    mediaDuration() {
      return this.mediaStore.duration;
    },
    scenario() {
      return this.componentsStore.get(this.componentsStore.activeScenario);
    },
  },
  mounted() {
    this.$nextTick(function () {
      this._sorting_interactable = interact(
        ".component-track:not([data-type='page']) > .handle"
      )
        .draggable({
          context: this.$el,
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
          context: this.$el,
          checker: this.handleDropzoneChecker,
          listeners: {
            dropmove: this.onHandleDropzoneDropmove,
          },
        });
    });
  },
  beforeUnmount() {
    if (this._sorting_interactable) {
      this._sorting_interactable.unset();
      delete this._sorting_interactable;
    }
  },
  methods: {
    onHandleDraggableStart(evt) {
      const { target: handle } = evt;
      const track = handle.parentNode;

      track.classList.add("dragging");
      handle.setAttribute("data-drag-y", 0);
    },
    onHandleDraggableMove(evt) {
      const { target: handle, dy } = evt;
      const y = parseFloat(handle.getAttribute("data-drag-y")) + dy;

      handle.setAttribute("data-drag-y", y);
      handle.style.transform = `translateY(${y}px)`;
    },
    onHandleDraggableEnd(evt) {
      const { target: handle } = evt;
      const track = handle.parentNode;

      track.classList.remove("dragging");
      handle.removeAttribute("data-drag-y");
      handle.style.transform = null;

      if (this.sorted) {
        const parent_track = track.parentNode.closest(".component-track");
        const parent_id = parent_track.getAttribute("data-id");
        const model = this.getComponent(parent_id);

        const children = [];
        parent_track
          .querySelectorAll(":scope > .children > .component-track")
          .forEach((child) => {
            children.unshift(child.getAttribute("data-id"));
          });

        this.editorStore.updateComponent(model, { children });

        this.resorted = false;
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
      const drag_y = parseFloat(drag_hanlde.getAttribute("data-drag-y"));

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
      drag_hanlde.setAttribute("data-drag-y", new_drag_y);
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
  background: $mediumgray;
  z-index: 0;
  --timeline-zoom: 100%;
  --timeline-offset: 0;

  .tracks-container {
    display: grid;
    position: relative;
    grid-template-columns: $controller-left-width auto;
    flex: 1;

    .playhead {
      position: absolute;
      grid-area: 1/2;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      pointer-events: none;
      z-index: 10;
    }
  }

  ::v-deep(.component-track) {
    &.dragging {
      z-index: 20;

      > .handle,
      > .time-wrapper {
        background: $darkgray;
      }

      .handle {
        z-index: 3;
      }

      .children {
        display: none;
      }
    }
  }
}
</style>