<i18n>
{
  "fr": {
    "contextmenu": {
      "page_before": "Ajouter une page avant",
      "page_after": "Ajouter une page après",
      "select": "Sélectionner",
      "deselect": "Désélectionner",
      "copy": "Copier",
      "cut": "Couper",
      "paste": "Coller",
      "delete": "Supprimer",
      "lock": "Verrouiller",
      "unlock": "Déverrouiller",
      "arrange": "Disposition",
      "to_front": "Mettre en premier plan",
      "to_back": "Mettre en arrière plan",
      "forward": "Mettre en avant",
      "backward": "Mettre en arrière",
    }
  },
  "en": {
    "contextmenu": {
      "page_before": "Add a page before",
      "page_after": "Add a page after",
      "select": "Select",
      "deselect": "Deselect",
      "copy": "Copy",
      "cut": "Cut",
      "paste": "Paste",
      "delete": "Delete",
      "lock": "Lock",
      "unlock": "Unlock",
      "arrange": "Arrange",
      "to_front": "Bring to front",
      "to_back": "Send to back",
      "forward": "Bring forward",
      "backward": "Send backward",
    }
  }
}
</i18n>

<template>
  <div
    :class="[
      'component-track',
      kebabCase(component.type),
      {
        'has-children': hasChildren,
        'has-start-time': hasStartTime,
        'has-end-time': hasEndTime,
        'has-selected-descendents': hasSelectedDescendents,
        expanded,
        selected,
        locked,
      },
    ]"
    :data-type="component.type"
    :data-id="component.id"
    :title="component.name"
    :style="{ '--depth': depth }"
  >
    <div
      ref="handle"
      v-contextmenu="contextmenuItems"
      class="handle"
      @click="onClick"
    >
      <component-icon :component="component" />

      <div v-if="hasChildren" class="toggle expander" @click.stop>
        <input
          :id="`handle--expand--${component.id}`"
          v-model="expanded"
          type="checkbox"
        />
        <label
          :for="`handle--expand--${component.id}`"
          title="Verrouiller/Déverrouiller"
        >
          <expander-icon class="icon" />
        </label>
      </div>

      <div class="label">{{ label }}</div>

      <div class="togglers" @click.stop>
        <div class="toggle lock">
          <input
            :id="`handle--lock--${component.id}`"
            v-model="locked"
            type="checkbox"
          />
          <label
            :for="`handle--lock--${component.id}`"
            title="Verrouiller/Déverrouiller"
          >
            <lock-icon class="icon" />
          </label>
        </div>
      </div>
    </div>

    <div
      ref="time-wrapper"
      v-contextmenu="contextmenuItems"
      class="time-wrapper"
      @click="onClick"
    >
      <div
        ref="time"
        :class="['time', { resizing, dragging }]"
        tabindex="0"
        :style="timeStyle"
        @mousedown="onMousedown"
        @focus="onFocus"
      >
        <template v-if="resizable">
          <div class="resize-handle right"></div>
          <div class="resize-handle left"></div>
        </template>
        <div :class="['background', { 'drag-handle': draggable }]"></div>
      </div>
    </div>

    <div v-if="hasChildren" class="children">
      <component-track
        v-for="child in children"
        :key="child.id"
        :component="child"
        :depth="depth + 1"
      />
    </div>

    <div class="aniamted-properties" @click.capture="onClick">
      <animated-property-track
        v-for="(value, property) in animatedProperties"
        :key="property"
        :model-value="value"
        :property="property"
        @update:model-value="onAnimatedPropertyUpdate(property, $event)"
      />
    </div>
  </div>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { round, kebabCase } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "../store";
import ExpanderIcon from "../assets/icons/expander.svg?inline";
import LockIcon from "../assets/icons/locked.svg?inline";
import AnimatedPropertyTrack from "./AnimatedPropertyTrack.vue";

export default {
  components: {
    ExpanderIcon,
    LockIcon,
    AnimatedPropertyTrack,
  },
  props: {
    component: {
      type: Object,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
    snapRange: {
      type: Number,
      default: 5,
    },
  },
  setup() {
    const store = useStore();
    const {
      time: mediaTime,
      duration: mediaDuration,
      seekTo: seekMediaTo,
    } = useModule("media_player");
    const {
      getModelByType,
      getComponentLabel,
      componentHasChildren,
      getComponentChildren,
      updateComponent,
      isComponentTimeable,
      deleteComponent,
    } = useModule("app_components");
    const {
      preview,
      isComponentSelected,
      isComponentLocked,
      lockComponent,
      unlockComponent,
      componentHasSelectedDescendents,
      selectComponent,
      deselectComponent,
      selectedComponents,
      copyComponents,
      cutComponents,
      arrangeComponent,
    } = useModule("app_preview");
    const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
      useModule("history");
    return {
      store,
      mediaTime,
      mediaDuration,
      seekMediaTo,
      getModelByType,
      getComponentLabel,
      componentHasChildren,
      getComponentChildren,
      updateComponent,
      isComponentTimeable,
      deleteComponent,
      preview,
      isComponentSelected,
      isComponentLocked,
      lockComponent,
      unlockComponent,
      componentHasSelectedDescendents,
      selectComponent,
      deselectComponent,
      selectedComponents,
      copyComponents,
      cutComponents,
      arrangeComponent,
      startHistoryGroup,
      endHistoryGroup,
    };
  },
  data() {
    return {
      expanded: false,
      resizing: false,
      dragging: false,
    };
  },
  computed: {
    model() {
      return this.getModelByType(this.component.type);
    },
    label() {
      return this.getComponentLabel(this.component);
    },
    selected() {
      return this.isComponentSelected(this.component);
    },
    locked: {
      get() {
        return this.isComponentLocked(this.component);
      },
      set(value) {
        this[value ? "lockComponent" : "unlockComponent"](this.component);
      },
    },
    hasChildren() {
      return this.componentHasChildren(this.component);
    },
    children() {
      const children = this.getComponentChildren(this.component);

      switch (this.component.type) {
        case "Page":
        case "Scenario":
          return children.slice().reverse();

        default:
          return children;
      }
    },
    hasSelectedDescendents() {
      return this.componentHasSelectedDescendents(this.component);
    },
    timeable() {
      return this.isComponentTimeable(this.component);
    },
    hasStartTime() {
      return this.timeable && this.component["start-time"] !== null;
    },
    hasEndTime() {
      return this.timeable && this.component["end-time"] !== null;
    },
    timeStyle() {
      const style = {};

      if (this.hasStartTime) {
        style.left = `${
          (this.component["start-time"] / this.mediaDuration) * 100
        }%`;
      }

      if (this.hasEndTime) {
        style.right = `${
          100 - (this.component["end-time"] / this.mediaDuration) * 100
        }%`;
      }

      return style;
    },
    animatedProperties() {
      return Object.entries(this.model.properties)
        .filter(([prop, definition]) => {
          return (
            "format" in definition &&
            definition.format === "animated" &&
            this.component[prop]?.animated
          );
        })
        .reduce(
          (acc, [prop]) => ({ ...acc, [prop]: this.component[prop].value }),
          {}
        );
    },
    resizable() {
      return this.timeable && this.selected && !this.locked;
    },
    draggable() {
      return (
        this.hasStartTime && this.hasEndTime && this.selected && !this.locked
      );
    },
    activeSnapTargets: {
      get() {
        return this.store.activeSnapTargets;
      },
      set(value) {
        this.store.activeSnapTargets = value;
      },
    },
    contextmenuItems() {
      if (this.preview) return [];

      const items = [
        {
          label: this.$t(`contextmenu.${this.selected ? "de" : ""}select`),
          handler: () => {
            if (this.selected) {
              this.deselectComponent(this.component);
            } else {
              this.selectComponent(this.component);
            }
          },
        },
        {
          label: this.$t(`contextmenu.${this.locked ? "un" : ""}lock`),
          handler: () => {
            if (this.locked) {
              this.unlockComponent(this.component);
            } else {
              this.lockComponent(this.component);
            }
          },
        },
      ];

      switch (this.component.type) {
        case "Scenario": {
          const type = this.$t(`app_components.labels.${this.component.type}`);
          const name = this.getComponentLabel(this.component);

          return [
            {
              label: `${type} (<i>${name}</i>)`,
              items,
            },
          ];
        }

        case "Page":
          return [
            {
              label: this.getComponentLabel(this.component),
              items: [
                ...items,
                {
                  label: this.$t("contextmenu.delete"),
                  handler: async () => {
                    await this.deleteComponent(this.component);
                  },
                },
                {
                  label: this.$t("contextmenu.page_before"),
                  handler: async () => {
                    await this.addSiblingPage(this.component, "before");
                  },
                },
                {
                  label: this.$t("contextmenu.page_after"),
                  handler: async () => {
                    await this.addSiblingPage(this.component, "after");
                  },
                },
              ],
            },
          ];

        default: {
          items.push(
            {
              label: this.$t("contextmenu.copy"),
              handler: () => {
                this.copyComponents([this.component]);
              },
            },
            {
              label: this.$t("contextmenu.cut"),
              handler: async () => {
                await this.cutComponents([this.component]);
              },
            }
          );

          const type = this.$t(`app_components.labels.${this.component.type}`);
          const name = this.getComponentLabel(this.component);

          return [
            {
              label: `${type} (<i>${name}</i>)`,
              items: [
                ...items,
                {
                  label: this.$t("contextmenu.delete"),
                  handler: async () => {
                    await this.deleteComponent(this.component);
                  },
                },
                {
                  label: this.$t("contextmenu.arrange"),
                  items: [
                    {
                      label: this.$t("contextmenu.to_front"),
                      handler: async () => {
                        await this.arrangeComponent(this.component, "front");
                      },
                    },
                    {
                      label: this.$t("contextmenu.to_back"),
                      handler: async () => {
                        await this.arrangeComponent(this.component, "back");
                      },
                    },
                    {
                      label: this.$t("contextmenu.forward"),
                      handler: async () => {
                        await this.arrangeComponent(this.component, "forward");
                      },
                    },
                    {
                      label: this.$t("contextmenu.backward"),
                      handler: async () => {
                        await this.arrangeComponent(this.component, "backward");
                      },
                    },
                  ],
                },
              ],
            },
          ];
        }
      }
    },
  },
  watch: {
    component: {
      handler(value) {
        this.expanded = value && value.type === "Scenario";
      },
      immediate: true,
    },
    selected(value) {
      if (value) {
        this.$nextTick(function () {
          this.$refs.handle.scrollIntoView();
        });
      }
    },
    resizable(value) {
      if (value) {
        this.setupInteractions();
      } else {
        this.destroyInteractions();
      }
    },
  },
  beforeUnmount() {
    this.destroyInteractions();
  },
  methods: {
    kebabCase,
    onClick(evt) {
      if (this.selected) {
        if (evt.shiftKey) {
          this.deselectComponent(this.component);
        }
      } else {
        this.selectComponent(this.component, evt.shiftKey);

        // If this is the only selected component and the current time is outside
        // its time limits, set the current time to its start time.
        if (
          this.selected &&
          this.selectedComponents.length === 1 &&
          this.timeable
        ) {
          if (
            (this.component["start-time"] !== null &&
              this.mediaTime < this.component["start-time"]) ||
            (this.component["end-time"] !== null &&
              this.mediaTime > this.component["end-time"])
          ) {
            this.seekMediaTo(this.component["start-time"] ?? 0);
          }
        }
      }
    },
    setupInteractions() {
      if (this._interactables) return;

      this._interactables = interact(this.$refs.time);
      this._interactables.resizable({
        edges: {
          right: ".resize-handle.right",
          left: ".resize-handle.left",
        },
        modifiers: [
          interact.modifiers.snap({
            targets: [this.getInteractableSnapTarget],
            relativePoints: [{ x: 0 }, { x: 1 }],
          }),
        ],
        listeners: {
          start: this.onResizableStart,
          move: this.onResizableMove,
          end: this.onResizableEnd,
        },
      });

      this._interactables.draggable({
        allowFrom: ".drag-handle",
        modifiers: [
          interact.modifiers.snap({
            targets: [this.getInteractableSnapTarget],
            relativePoints: [{ x: 0 }, { x: 1 }],
          }),
        ],
        listeners: {
          start: this.onDraggableStart,
          move: this.onDraggableMove,
          end: this.onDraggableEnd,
        },
      });
    },
    destroyInteractions() {
      if (this._interactables) {
        this._interactables.unset();
        delete this._interactables;
      }
    },
    getInteractableSnapTarget(x, y, interaction, offset) {
      let min_distance = this.snapRange;
      let target = null;

      if (offset.index === 0) this.activeSnapTargets = [];

      // Check if playhead is in range.
      const { left, width } =
        this.$refs["time-wrapper"].getBoundingClientRect();
      const playhead_x = (this.mediaTime / this.mediaDuration) * width + left;
      const distance = Math.abs(playhead_x - x);
      if (distance <= min_distance) {
        min_distance = distance;
        target = { x: playhead_x };
      }

      // Loop through tracks to check if they are in range.
      this.$el
        .closest(".component-track[data-type='Scenario']")
        .querySelectorAll(
          ".component-track .time-wrapper .time:not(.resizing, .dragging)"
        )
        .forEach((track_time) => {
          if (track_time.offsetParent === null) {
            // Skip if the track is not visible.
            return;
          }

          const { left: track_left, width: track_width } =
            track_time.getBoundingClientRect();
          [track_left, track_left + track_width].forEach((pos) => {
            const distance = Math.abs(pos - x);
            if (distance <= min_distance) {
              min_distance = distance;
              target = { x: pos };
            }
          });
        });

      if (target) this.activeSnapTargets.push(target.x);

      return target;
    },
    onResizableStart() {
      this.resizing = true;
      this.startHistoryGroup({ coalesce: true });
    },
    async onResizableMove(evt) {
      const time_wrapper = this.$refs["time-wrapper"];
      const { width: wrapper_width } = time_wrapper.getBoundingClientRect();
      const prop = evt.edges.right ? "end-time" : "start-time";
      const data = {};

      let newValue =
        this.component[prop] ?? (prop === "end-time" ? this.mediaDuration : 0);
      newValue += evt.delta.x * (this.mediaDuration / wrapper_width);

      // Don't go below 0 or above duration.
      if (newValue < 0 || newValue > this.mediaDuration) return;

      data[prop] = round(newValue, 2);

      await this.updateComponent(this.component, data);
    },
    onResizableEnd(evt) {
      this.endHistoryGroup();
      this.activeSnapTargets = [];
      this.resizing = false;

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    onDraggableStart() {
      this.dragging = true;
      this.startHistoryGroup({ coalesce: true });
    },
    async onDraggableMove(evt) {
      const time_wrapper = this.$refs["time-wrapper"];
      const { width: wrapper_width } = time_wrapper.getBoundingClientRect();
      const props = ["start-time", "end-time"];
      const data = {};

      const doUpdate = props.every((prop) => {
        let newValue =
          this.component[prop] +
          evt.delta.x * (this.mediaDuration / wrapper_width);

        // Don't go below 0 or above duration.
        if (newValue < 0 || newValue > this.mediaDuration) return false;

        data[prop] = round(newValue, 2);
        return true;
      });

      if (doUpdate) await this.updateComponent(this.component, data);
    },
    onDraggableEnd() {
      this.endHistoryGroup();
      this.activeSnapTargets = [];
      this.dragging = false;
    },
    async onAnimatedPropertyUpdate(property, value) {
      await this.updateComponent(this.component, {
        [property]: {
          value,
          animated: true,
        },
      });
    },
    onMousedown() {
      if (this.preview) return;

      // Skip focus handler.
      this._skipFocus = true;
    },
    onFocus() {
      if (this._skipFocus) {
        delete this._skipFocus;
        return;
      }

      if (this.preview) return;

      this.selectComponent(this.component);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@metascore-library/editor/scss/variables";

.component-track {
  display: contents;
  user-select: none;

  .handle,
  .time-wrapper,
  .aniamted-properties :deep(.handle),
  .aniamted-properties :deep(.keyframes-wrapper) {
    height: 2em;
    border-top: 1px solid var(--metascore-color-bg-tertiary);
    border-bottom: 1px solid var(--metascore-color-bg-tertiary);
    box-sizing: border-box;
  }

  .handle,
  .aniamted-properties :deep(.handle) {
    display: flex;
    position: relative;
    left: 0;
    grid-column: 1;
    padding: 0 0.25em 0 calc(var(--depth) * 0.5em);
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 0.25em;
    background: var(--metascore-color-bg-secondary);
    border-right: 2px solid var(--metascore-color-bg-tertiary);
    touch-action: none;
    user-select: none;
    z-index: 2;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--metascore-color-black);
      opacity: min(calc(var(--depth) * 0.05), 0.5);
      pointer-events: none;
    }

    > .icon {
      width: 1.5em;
      flex: 0 0 auto;
      color: white;
    }

    .label {
      flex: 1 1 auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
      pointer-events: none;
      z-index: 1;
    }
  }

  .handle {
    .toggle {
      input {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: 0;
        visibility: hidden;
        z-index: -1;
      }

      label {
        display: block;
        font-size: 0.75em;
        cursor: pointer;

        .icon {
          display: block;
          width: 1em;
          height: 1em;
          color: var(--metascore-color-white);
          opacity: 0.5;
        }
      }
    }

    .expander {
      label {
        padding: 0 0.5em;
      }
    }

    .togglers {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      gap: 0.25em;

      .toggle {
        label {
          padding: 0.25em;
          background: var(--metascore-color-bg-tertiary);
        }

        .icon {
          display: block;
        }

        input:checked + label {
          .icon {
            opacity: 1;
          }
        }
      }
    }
  }

  .aniamted-properties :deep(.handle) {
    padding-left: calc(var(--depth) * 0.5em + 1em);

    > .icon {
      height: 1em;
      opacity: 0.5;
    }
  }

  .time-wrapper {
    position: relative;
    height: 100%;
    grid-column: 2;
    background: var(--metascore-color-bg-secondary);
    cursor: pointer;

    .time {
      position: absolute;
      top: 0.5em;
      bottom: 0.5em;
      left: 0;
      right: 0;

      .resize-handle {
        position: absolute;
        top: 0;
        width: 0.25em;
        height: 100%;
        background: #fff;
        z-index: 1;

        &.left {
          left: 0;
        }
        &.right {
          right: 0;
        }
      }

      .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #555;
        box-sizing: border-box;
        box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.5);
        opacity: 0.5;
      }

      &:focus {
        outline: none;
      }

      &:focus-visible {
        outline-offset: 0.1em;
        outline-style: dashed;
        outline-width: 1px;
      }
    }
  }

  .children {
    display: none;
  }

  .aniamted-properties {
    display: contents;
  }

  &.expanded,
  &.has-selected-descendents {
    > .handle {
      .expander {
        label {
          .icon {
            transform: rotate(90deg);
          }
        }
      }
    }

    > .children {
      display: contents;
    }
  }

  @each $component, $color in $component-colors {
    @if $component == default {
      > .time-wrapper .time .background {
        background-color: var(--metascore-color-component-#{$component});
      }
    } @else {
      &.#{$component} {
        > .time-wrapper .time .background {
          background-color: var(--metascore-color-component-#{$component});
        }
      }
    }
  }

  &:not(.has-children) {
    .label {
      margin-left: 0.5em;
    }
  }

  &:not(.has-start-time) {
    > .time-wrapper .background {
      clip-path: polygon(
        0 0,
        4px 25%,
        0 50%,
        4px 75%,
        0 100%,
        100% 100%,
        100% 0
      );
    }
  }

  &:not(.has-end-time) {
    > .time-wrapper .background {
      clip-path: polygon(
        0 0,
        0 100%,
        100% 100%,
        calc(100% - 4px) 75%,
        100% 50%,
        calc(100% - 4px) 25%,
        100% 0
      );
    }
  }

  &:not(.has-start-time):not(.has-end-time) {
    > .time-wrapper .background {
      clip-path: polygon(
        0 0,
        4px 25%,
        0 50%,
        4px 75%,
        0 100%,
        100% 100%,
        calc(100% - 4px) 75%,
        100% 50%,
        calc(100% - 4px) 25%,
        100% 0
      );
    }
  }

  &.selected {
    > .handle,
    > .time-wrapper {
      background: var(--metascore-color-bg-primary);
      .time {
        .background {
          opacity: 1;
        }
      }
    }
  }

  &.scenario {
    > .handle {
      padding-left: 0.5em;
      .expander {
        display: none;
      }
    }
  }

  &.page {
    &:first-child > .time-wrapper .resize-handle.left,
    &:last-child > .time-wrapper .resize-handle.right {
      display: none;
    }
  }
}
</style>
