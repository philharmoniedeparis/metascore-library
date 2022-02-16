<template>
  <player-component-wrapper
    :model="model"
    :class="{ selected, 'drag-over': dragOver }"
    @click.stop="onClick"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="editor-component-wrapper">
      <slot />
    </div>
  </player-component-wrapper>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { round } from "lodash";
import { mapGetters, mapMutations, mapActions } from "vuex";
import PlayerComponentWrapper from "@metascore-library/player/modules/app_components/components/ComponentWrapper";

export default {
  components: {
    PlayerComponentWrapper,
  },
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  emits: ["componentclick"],
  data() {
    return {
      dragOver: false,
    };
  },
  computed: {
    ...mapGetters(["isComponentSelected"]),
    selected() {
      return this.isComponentSelected(this.model);
    },
  },
  watch: {
    selected(value) {
      if (value && (this.model.$isPositionable || this.model.$isResizable)) {
        this._interactables = interact(this.$el, {
          context: this.$el.ownerDocument,
        });

        if (this.model.$isPositionable) {
          let allowFrom = null;

          switch (this.model.type) {
            case "Block":
              allowFrom = ".pager";
              break;
            case "Controller":
              allowFrom = ".timer";
              break;
          }

          this._interactables.draggable({
            allowFrom,
            listeners: {
              move: this.onDragMove,
              end: this.onDragEnd,
            },
          });
        }

        if (this.model.$isResizable) {
          this._interactables.resizable({
            edges: { top: true, left: true, bottom: true, right: true },
            listeners: {
              move: this.onResize,
            },
          });
        }
      } else {
        // Remove interactables.
        if (this._interactables) {
          this._interactables.unset();
          delete this._interactables;
        }
      }
    },
  },
  beforeUnmount() {
    // Remove interactables.
    if (this._interactables) {
      this._interactables.unset();
      delete this._interactables;
    }
  },
  methods: {
    ...mapMutations([
      "selectComponent",
      "deselectComponent",
      "deselectAllComponents",
    ]),
    ...mapActions(["updateComponent", "addComponent"]),
    onClick(evt) {
      const model = this.model;

      if (this.selected) {
        if (evt.shiftKey) {
          this.deselectComponent(model);
          evt.stopImmediatePropagation();
        }
      } else {
        if (!evt.shiftKey) {
          this.deselectAllComponents();
        }

        this.selectComponent(model);
        evt.stopImmediatePropagation();
      }
    },
    onDragMove(evt) {
      const position = this.model.position;

      this.updateComponent({
        model: this.model,
        data: {
          position: [position[0] + evt.delta.x, position[1] + evt.delta.y],
        },
      });
    },
    onDragEnd(evt) {
      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    onResize(evt) {
      const position = this.model.position;

      this.updateComponent({
        model: this.model,
        data: {
          position: [
            position[0] + evt.deltaRect.left,
            position[1] + evt.deltaRect.top,
          ],
          dimension: [round(evt.rect.width), round(evt.rect.height)],
        },
      });
    },
    getModelFromDragEvent(evt) {
      if (evt.dataTransfer.types.includes("metascore/component")) {
        const data = evt.dataTransfer.getData("metascore/component");
        return JSON.parse(data);
      }
    },
    isDropAllowed(model) {
      if (model) {
        switch (this.model.type) {
          case "Scenario":
          case "Page":
            return !["Scenario", "Page"].includes(model.type);
          case "Block":
            return model.type === "Page";
        }
      }

      return false;
    },
    onDragEnter(evt) {
      const draggedModel = this.getModelFromDragEvent(evt);
      if (this.isDropAllowed(draggedModel)) {
        this.dragOver = true;
        evt.stopPropagation();
      }
    },
    onDragOver(evt) {
      const draggedModel = this.getModelFromDragEvent(evt);
      if (this.isDropAllowed(draggedModel)) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    },
    onDragLeave() {
      this.dragOver = false;
    },
    onDrop(evt) {
      const droppedModel = this.getModelFromDragEvent(evt);
      if (this.isDropAllowed(droppedModel)) {
        switch (droppedModel.type) {
          case "Page":
            break;

          default: {
            const { left, top } = evt.target.getBoundingClientRect();
            droppedModel.position = [
              Math.round(evt.clientX - left),
              Math.round(evt.clientY - top),
            ];
          }
        }

        this.addComponent({
          data: droppedModel,
          parent: this.model,
        });

        this.dragOver = false;
        evt.stopPropagation();
        evt.preventDefault();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.metaScore-component {
  overflow: visible;
  touch-action: none;
  user-select: none;

  &.selected {
    @each $component, $color in $component-colors {
      @if $component == default {
        box-shadow: 0 0 0.5em 0 $color;
      } @else {
        &.#{$component} {
          box-shadow: 0 0 0.5em 0 $color;
        }
      }
    }
  }

  & > .editor-component-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: inherit;
  }

  &.drag-over {
    box-shadow: inset 0px 0px 1em 0.25em rgba(0, 0, 0, 0.75);
  }
}
</style>
