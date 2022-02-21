<template>
  <component-wrapper
    :model="model"
    :class="{ selected, 'drag-over': dragOver }"
    @contextmenu="onContextmenu"
    @click.stop="onClick"
    @dragenter="onDragenter"
    @dragover="onDragover"
    @dragleave="onDragleave"
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
import { useContextmenu } from "@metascore-library/core/modules/context_menu";
import { ComponentWrapper } from "@metascore-library/player/modules/app_components";

export default {
  components: {
    ComponentWrapper,
  },
  props: {
    /**
     * The associated component model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  emits: ["componentclick"],
  setup() {
    const { addItems: addContextmenuItems } = useContextmenu();

    return {
      addContextmenuItems,
    };
  },
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
    isPositionable() {
      return this.model.$isPositionable;
    },
    isResizable() {
      return this.model.$isResizable;
    },
    contextmenuItems() {
      switch (this.model.type) {
        case "Scenario":
          return [];

        case "Block":
          return [];

        case "Page":
          return [];

        default:
          return [
            {
              label: `${this.model.name} (${this.model.type})`,
              items: [
                {
                  label: "Select",
                  handler: () => {
                    console.log("Select");
                  },
                },
                {
                  label: "Copy",
                  handler: () => {
                    console.log("Copy");
                  },
                },
                {
                  label: "Paste",
                  handler: () => {
                    console.log("Copy");
                  },
                },
                {
                  label: "Delete",
                  handler: () => {
                    console.log("Delete");
                  },
                },
                {
                  label: "Lock",
                  handler: () => {
                    console.log("Lock");
                  },
                },
                {
                  label: "Unlock",
                  handler: () => {
                    console.log("Unlock");
                  },
                },
                {
                  label: "Arrange",
                  items: [
                    {
                      label: "Bring to front",
                      handler: () => {
                        console.log("Bring to front");
                      },
                    },
                    {
                      label: "Send to back",
                      handler: () => {
                        console.log("Send to back");
                      },
                    },
                    {
                      label: "Bring forward",
                      handler: () => {
                        console.log("Bring forward");
                      },
                    },
                    {
                      label: "Send backward",
                      handler: () => {
                        console.log("Send backward");
                      },
                    },
                  ],
                },
              ],
            },
          ];
      }
    },
  },
  watch: {
    selected(value) {
      if (value && (this.isPositionable || this.isResizable)) {
        this._interactables = interact(this.$el, {
          context: this.$el.ownerDocument,
        });

        if (this.isPositionable) {
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
              move: this.onDraggableMove,
              end: this.onDraggableEnd,
            },
          });
        }

        if (this.isResizable) {
          this._interactables.resizable({
            edges: { top: true, left: true, bottom: true, right: true },
            margin: 5,
            listeners: {
              move: this.onResizableMove,
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
      if (this.selected) {
        if (evt.shiftKey) {
          this.deselectComponent(this.model);
          evt.stopImmediatePropagation();
        }
      } else {
        if (!evt.shiftKey) {
          this.deselectAllComponents();
        }

        this.selectComponent(this.model);
        evt.stopImmediatePropagation();
      }
    },
    onDraggableMove(evt) {
      const position = this.model.position;

      this.updateComponent({
        model: this.model,
        data: {
          position: [position[0] + evt.delta.x, position[1] + evt.delta.y],
        },
      });
    },
    onDraggableEnd(evt) {
      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    onResizableMove(evt) {
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
    onDragenter(evt) {
      this.dragEnterCounter++;

      const draggedModel = this.getModelFromDragEvent(evt);
      if (this.isDropAllowed(draggedModel)) {
        this.dragOver = true;
        evt.stopPropagation();
      }
    },
    onDragover(evt) {
      const draggedModel = this.getModelFromDragEvent(evt);
      if (this.isDropAllowed(draggedModel)) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    },
    onDragleave() {
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
    onContextmenu() {
      this.addContextmenuItems(this.contextmenuItems);
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
