<i18n>
{
  "fr": {
    "contextmenu": {
      "page_before": "Add a page before",
      "page_after": "Add a page after",
      "select": "Sélectionner",
      "deselect": "Désélectionner",
      "copy": "Copier",
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
import { round, omit } from "lodash";
import { useStore } from "@metascore-library/core/module-manager";
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
    const editorStore = useStore("editor");
    const clipboardStore = useStore("clipboard");
    const contextmenuStore = useStore("contextmenu");
    return { editorStore, clipboardStore, contextmenuStore };
  },
  data() {
    return {
      dragOver: false,
      dragEnterCounter: 0,
    };
  },
  computed: {
    selected() {
      return this.editorStore.isComponentSelected(this.model);
    },
    locked() {
      return this.editorStore.isComponentLocked(this.model);
    },
    isPositionable() {
      return this.model.$isPositionable;
    },
    isResizable() {
      return this.model.$isResizable;
    },
    clipboardDataAvailable() {
      if (this.clipboardStore.format !== "metascore/component") {
        return false;
      }

      const model = this.clipboardStore.data;

      // @todo: base this on possible Model children
      switch (this.model.type) {
        case "Scenario":
          return model.type === "Block";
        case "Page":
          return ["SVG", "Content", "Animation"].includes(model.type);
        default:
          return false;
      }
    },
    contextmenuItems() {
      const items = [
        {
          label: this.$t(`contextmenu.${this.selected ? "de" : ""}select`),
          handler: () => {
            if (this.selected) {
              this.editorStore.deselectComponent(this.model);
            } else {
              this.editorStore.selectComponent(this.model);
            }
          },
        },
        {
          label: this.$t(`contextmenu.${this.locked ? "un" : ""}lock`),
          handler: () => {
            if (this.locked) {
              this.editorStore.unlockComponent(this.model);
            } else {
              this.editorStore.lockComponent(this.model);
            }
          },
        },
      ];

      if (this.clipboardDataAvailable) {
        items.push({
          label: this.$t("contextmenu.paste"),
          handler: () => {
            // @todo
            const data = this.clipboardStore.data;
            console.log(data);
          },
        });
      }

      switch (this.model.type) {
        case "Scenario":
          return [
            {
              label: `${this.model.type} (${this.model.name})`,
              items,
            },
          ];

        case "Page":
          return [
            {
              label: this.model.type,
              items: [
                ...items,
                {
                  label: this.$t("contextmenu.delete"),
                  handler: () => {
                    this.editorStore.deleteComponent(this.model);
                  },
                },
                {
                  label: this.$t("contextmenu.page_before"),
                  handler: () => {
                    this.editorStore.addPageBefore(this.model);
                  },
                },
                {
                  label: this.$t("contextmenu.page_after"),
                  handler: () => {
                    this.editorStore.addPageAfter(this.model);
                  },
                },
              ],
            },
          ];

        default:
          items.push({
            label: this.$t("contextmenu.copy"),
            handler: () => {
              this.clipboardStore.setData(
                `metascore/component`,
                omit(this.model.toJson(), ["id"])
              );
            },
          });

          return [
            {
              label: `${this.model.type} (${this.model.name})`,
              items: [
                ...items,
                {
                  label: this.$t("contextmenu.delete"),
                  handler: () => {
                    this.editorStore.deleteComponent(this.model);
                  },
                },
                {
                  label: this.$t("contextmenu.arrange"),
                  items: [
                    {
                      label: this.$t("contextmenu.to_front"),
                      handler: () => {
                        this.editorStore.arrangeComponent(this.model, "front");
                      },
                    },
                    {
                      label: this.$t("contextmenu.to_back"),
                      handler: () => {
                        this.editorStore.arrangeComponent(this.model, "back");
                      },
                    },
                    {
                      label: this.$t("contextmenu.forward"),
                      handler: () => {
                        this.editorStore.arrangeComponent(
                          this.model,
                          "forward"
                        );
                      },
                    },
                    {
                      label: this.$t("contextmenu.backward"),
                      handler: () => {
                        this.editorStore.arrangeComponent(
                          this.model,
                          "backward"
                        );
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
    onClick(evt) {
      if (this.selected) {
        if (evt.shiftKey) {
          this.editorStore.deselectComponent(this.model);
          evt.stopImmediatePropagation();
        }
      } else {
        this.editorStore.selectComponent(this.model, evt.shiftKey);
        evt.stopImmediatePropagation();
      }
    },
    onDraggableMove(evt) {
      const position = this.model.position;

      this.editorStore.updateComponent(this.model, {
        position: [position[0] + evt.delta.x, position[1] + evt.delta.y],
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

      this.editorStore.updateComponent(this.model, {
        position: [
          position[0] + evt.deltaRect.left,
          position[1] + evt.deltaRect.top,
        ],
        dimension: [round(evt.rect.width), round(evt.rect.height)],
      });
    },
    getModelTypeFromDragEvent(evt) {
      let type = null;
      evt.dataTransfer.types.some((format) => {
        const matches = format.match(/^metascore\/component:(.*)$/);
        if (matches) {
          type = matches[1];
          return true;
        }
      });
      return type;
    },
    getModelFromDragEvent(evt) {
      const type = this.getModelTypeFromDragEvent(evt);
      if (type) {
        const format = `metascore/component:${type}`;
        if (evt.dataTransfer.types.includes(format)) {
          const data = evt.dataTransfer.getData(format);
          return JSON.parse(data);
        }
      }
    },
    isDropAllowed(evt) {
      const type = this.getModelTypeFromDragEvent(evt);

      if (type) {
        switch (this.model.type) {
          case "Scenario":
          case "Page":
            return !["Scenario", "Page"].includes(type);
          case "Block":
            return type === "Page";
        }
      }

      return false;
    },
    onDragenter(evt) {
      this.dragEnterCounter++;

      if (this.isDropAllowed(evt)) {
        this.dragOver = true;
        evt.stopPropagation();
      }
    },
    onDragover(evt) {
      if (this.isDropAllowed(evt)) {
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

      if (this.isDropAllowed(evt)) {
        const droppedModel = this.getModelFromDragEvent(evt);
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

        const model = await this.editorStore.addComponent(
          droppedModel,
          this.model
        );
        this.editorStore.selectComponent(model);

        evt.stopPropagation();
        evt.preventDefault();
      }
    },
    onContextmenu() {
      this.contextmenuStore.addItems(this.contextmenuItems);
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
