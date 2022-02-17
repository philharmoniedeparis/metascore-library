<template>
  <component-wrapper
    v-contextmenu="contextmenuItems"
    :model="model"
    :class="{ selected, 'drag-over': dragOver }"
    @click.stop="onClick"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <slot />
  </component-wrapper>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { round } from "lodash";
import { mapGetters, mapMutations, mapActions } from "vuex";
import ComponentWrapper from "@metascore-library/player/modules/app_components/components/ComponentWrapper";

export default {
  components: {
    ComponentWrapper,
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
      dragEnterCounter: 0,
    };
  },
  computed: {
    ...mapGetters(["isComponentSelected"]),
    selected() {
      return this.isComponentSelected(this.model);
    },
    contextmenuItems() {
      return [
        {
          label: `${this.model.type} ${this.model.name}`,
          handler: () => {
            console.log(this.model);
          },
        },
      ];
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
            margin: 5,
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
      this.dragEnterCounter++;

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
      if (--this.dragEnterCounter === 0) {
        this.dragOver = false;
      }
    },
    async onDrop(evt) {
      this.dragEnterCounter = 0;
      this.dragOver = false;

      const droppedModel = this.getModelFromDragEvent(evt);
      if (this.isDropAllowed(droppedModel)) {
        switch (droppedModel.type) {
          case "Page":
            break;

          default: {
            const { left, top } = this.$el.getBoundingClientRect();
            droppedModel.position = [
              Math.round(evt.clientX - left),
              Math.round(evt.clientY - top),
            ];
          }
        }

        const model = await this.addComponent({
          data: droppedModel,
          parent: this.model,
        });
        this.deselectAllComponents();
        this.selectComponent(model);

        evt.stopPropagation();
        evt.preventDefault();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.metaScore-component {
  touch-action: none;
  user-select: none;

  &.block {
    &:hover::v-deep(> .pager) {
      display: flex !important;
    }
  }

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

  &.drag-over {
    box-shadow: inset 0px 0px 1em 0.25em rgba(0, 0, 0, 0.75);
  }
}
</style>
