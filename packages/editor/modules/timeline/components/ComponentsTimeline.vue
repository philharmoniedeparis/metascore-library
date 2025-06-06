<i18n>
{
  "fr": {
    "hotkey": {
      "group": "Timeline",
      "tab": "Sélectionner le composant suivant",
      "shift+tab": "Sélectionner le composant précédent",
      "mod+c": "Copier le(s) composant(s) sélectionné(s)",
      "mod+v": "Coller le(s) composant(s)",
      "mod+x": "Couper le(s) composant(s) sélectionné(s)",
      "mod+d": "Dupliquer le(s) composant(s) sélectionné(s)",
      "mod+l": "Verrouiller/déverrouiller le(s) composant(s) sélectionné(s)",
      "delete": "Supprimer le(s) composant(s) sélectionné(s)",
      "backspace": "Supprimer le(s) composant(s) sélectionné(s)",
    }
  },
  "en": {
    "hotkey": {
      "group": "Timeline",
      "tab": "Select the next component",
      "shift+tab": "Select the previous component",
      "mod+c": "Copy selected component(s)",
      "mod+v": "Paste component(s)",
      "mod+x": "Cut selected component(s)",
      "mod+d": "Duplicate selected component(s)",
      "mod+l": "Lock/unlock selected component(s)",
      "delete": "Delete selected component(s)",
      "backspace": "Delete selected component(s)",
    }
  }
}
</i18n>

<template>
  <div v-hotkey.local.stop="hotkeys" class="timeline" tabindex="0">
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
import { trapTabFocus } from "@core/utils/dom";
import { useModule } from "@core/services/module-manager";
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
      deleteComponent,
    } = useModule("app_components");
    const {
      preview,
      isComponentLocked,
      lockComponents,
      unlockComponents,
      selectedComponents,
      copyComponents,
      cutComponents,
      pasteComponents,
    } = useModule("app_preview");
    const { time: mediaTime, duration: mediaDuration } =
      useModule("media_player");
    const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
      useModule("history");

    return {
      mediaTime,
      mediaDuration,
      getComponentsByType,
      getComponent,
      activeScenario,
      updateComponent,
      deleteComponent,
      preview,
      isComponentLocked,
      lockComponents,
      unlockComponents,
      selectedComponents,
      copyComponents,
      cutComponents,
      pasteComponents,
      startHistoryGroup,
      endHistoryGroup,
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
        marginLeft: `calc(${this.trackTimeOffset} - ${
          this.playheadWidth / 2
        }px)`,
      };
    },
    hotkeys() {
      if (this.preview) return {};

      return {
        group: this.$t("hotkey.group"),
        keys: {
          tab: {
            handler: (evt) => {
              trapTabFocus(this.$el, evt);
            },
            description: this.$t("hotkey.tab"),
          },
          "shift+tab": {
            handler: (evt) => {
              trapTabFocus(this.$el, evt);
            },
            description: this.$t("hotkey.shift+tab"),
          },
          "mod+c": {
            handler: (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.selectedComponents;
              if (selected.length > 0) {
                this.copyComponents(selected);
              }
            },
            description: this.$t("hotkey.mod+c"),
          },
          "mod+x": {
            handler: async (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.selectedComponents;
              if (selected.length > 0) {
                await this.cutComponents(selected);
              }
            },
            description: this.$t("hotkey.mod+x"),
          },
          "mod+v": {
            handler: (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.selectedComponents;
              if (selected.length > 0) {
                this.pasteComponents(selected[0]);
              }
            },
            description: this.$t("hotkey.mod+v"),
          },
          "mod+d": {
            handler: (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.selectedComponents;
              if (selected.length > 0) {
                this.copyComponents(selected);
                this.pasteComponents(selected[0]);
              }
            },
            description: this.$t("hotkey.mod+d"),
          },
          "mod+l": {
            handler: (evt) => {
              evt.preventDefault();

              if (evt.repeat) return;

              const selected = this.selectedComponents;
              if (selected.length > 0) {
                const master = selected[0];
                const locked = this.isComponentLocked(master);
                this[`${locked ? "un" : ""}lockComponents`](selected);
              }
            },
            description: this.$t("hotkey.mod+l"),
          },
          delete: {
            handler: async (evt) => {
              evt.preventDefault();
              if (evt.repeat) return;
              await this.deleteSelectedComponents();
            },
            description: this.$t("hotkey.delete"),
          },
          backspace: {
            handler: async (evt) => {
              evt.preventDefault();
              if (evt.repeat) return;
              await this.deleteSelectedComponents();
            },
            description: this.$t("hotkey.backspace"),
          },
        },
      };
    },
  },
  mounted() {
    this._interactable = interact(".component-track.sortable > .handle", {
      context: this.$el,
    })
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
    async deleteSelectedComponents() {
      const selected = this.selectedComponents;
      this.startHistoryGroup();
      for (const component of selected) {
        if (component.type !== "Scenario") {
          await this.deleteComponent(component);
        }
      }
      this.endHistoryGroup();
    },
  },
};
</script>

<style lang="scss" scoped>
.timeline {
  display: flex;
  flex-direction: row;
  background: var(--metascore-color-bg-tertiary);
  z-index: 0;

  .tracks-container {
    display: grid;
    position: relative;
    grid-template-columns: var(--metascore-controller-left-width) auto;
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
        background: var(--metascore-color-bg-tertiary);
      }

      .handle {
        z-index: 3;
      }

      .children {
        display: none;
      }
    }
  }

  :deep(.component-track > .time-wrapper),
  :deep(.animated-property-track > .keyframes-wrapper) {
    width: v-bind(trackTimeWidth);
    margin-left: v-bind(trackTimeOffset);
  }
}
</style>
