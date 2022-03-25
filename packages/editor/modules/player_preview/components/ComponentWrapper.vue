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
  <player-component-wrapper
    :component="component"
    :class="{ selected, preview, 'drag-over': dragOver }"
    @contextmenu="onContextmenu"
    @click.stop="onClick"
    @dragenter="onDragenter"
    @dragover="onDragover"
    @dragleave="onDragleave"
    @drop="onDrop"
  >
    <slot />
  </player-component-wrapper>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { round, omit } from "lodash";
import useEditorStore from "@metascore-library/editor/store";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "../store";

export default {
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  emits: ["componentclick"],
  setup() {
    const store = useStore();
    const editorStore = useEditorStore();
    const clipboardStore = useModule("clipboard").useStore();
    const componentsStore = useModule("app_components").useStore();
    const contextmenuStore = useModule("contextmenu").useStore();
    const historyStore = useModule("history").useStore();
    return {
      store,
      editorStore,
      clipboardStore,
      componentsStore,
      contextmenuStore,
      historyStore,
    };
  },
  data() {
    return {
      dragOver: false,
      dragEnterCounter: 0,
    };
  },
  computed: {
    model() {
      return this.componentsStore.getModel(this.component.type);
    },
    preview() {
      return this.store.preview;
    },
    selected() {
      return this.editorStore.isComponentSelected(this.component);
    },
    locked() {
      return this.editorStore.isComponentLocked(this.component);
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

      const component = this.clipboardStore.data;

      switch (this.component.type) {
        case "Scenario":
        case "Page":
          return this.model.schema.properties[
            "children"
          ].items.properties.schema.enum.includes(component.type);
        case "Block":
          return component.type === "Page";
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
              this.editorStore.deselectComponent(this.component);
            } else {
              this.editorStore.selectComponent(this.component);
            }
          },
        },
        {
          label: this.$t(`contextmenu.${this.locked ? "un" : ""}lock`),
          handler: () => {
            if (this.locked) {
              this.editorStore.unlockComponent(this.component);
            } else {
              this.editorStore.lockComponent(this.component);
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

      switch (this.component.type) {
        case "Scenario":
          return [
            {
              label: `${this.component.type} (${this.component.name})`,
              items,
            },
          ];

        case "Page":
          return [
            {
              label: this.component.type,
              items: [
                ...items,
                {
                  label: this.$t("contextmenu.delete"),
                  handler: () => {
                    this.editorStore.deleteComponent(this.component);
                  },
                },
                {
                  label: this.$t("contextmenu.page_before"),
                  handler: () => {
                    this.editorStore.addPageBefore(this.component);
                  },
                },
                {
                  label: this.$t("contextmenu.page_after"),
                  handler: () => {
                    this.editorStore.addPageAfter(this.component);
                  },
                },
              ],
            },
          ];

        default:
          items.push({
            label: this.$t("contextmenu.copy"),
            handler: () => {
              const data = omit(this.component, ["id"]);
              this.clipboardStore.setData(`metascore/component`, data);
            },
          });

          return [
            {
              label: `${this.component.type} (${this.component.name})`,
              items: [
                ...items,
                {
                  label: this.$t("contextmenu.delete"),
                  handler: () => {
                    this.editorStore.deleteComponent(this.component);
                  },
                },
                {
                  label: this.$t("contextmenu.arrange"),
                  items: [
                    {
                      label: this.$t("contextmenu.to_front"),
                      handler: () => {
                        this.editorStore.arrangeComponent(
                          this.component,
                          "front"
                        );
                      },
                    },
                    {
                      label: this.$t("contextmenu.to_back"),
                      handler: () => {
                        this.editorStore.arrangeComponent(
                          this.component,
                          "back"
                        );
                      },
                    },
                    {
                      label: this.$t("contextmenu.forward"),
                      handler: () => {
                        this.editorStore.arrangeComponent(
                          this.component,
                          "forward"
                        );
                      },
                    },
                    {
                      label: this.$t("contextmenu.backward"),
                      handler: () => {
                        this.editorStore.arrangeComponent(
                          this.component,
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
    preview(value) {
      if (value) {
        this.destroyInteractions();
      } else if (this.selected) {
        this.setupInteractions();
      }
    },
    selected(value) {
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
    onClick(evt) {
      if (this.preview) {
        return;
      }

      if (this.selected) {
        if (evt.shiftKey) {
          this.editorStore.deselectComponent(this.component);
          evt.stopImmediatePropagation();
        }
      } else {
        this.editorStore.selectComponent(this.component, evt.shiftKey);
        evt.stopImmediatePropagation();
      }
    },
    setupInteractions() {
      if (this._interactables) {
        return;
      }

      if (this.isPositionable || this.isResizable) {
        this._interactables = interact(this.$el, {
          context: this.$el.ownerDocument,
        });

        if (this.isPositionable) {
          let allowFrom = null;

          switch (this.component.type) {
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
              start: this.onDraggableStart,
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
      }
    },
    destroyInteractions() {
      if (this._interactables) {
        this._interactables.unset();
        delete this._interactables;
      }
    },
    onDraggableStart() {
      this.historyStore.startGroup();
    },
    onDraggableMove(evt) {
      this.editorStore.getSelectedComponents.forEach((component) => {
        const position = component.position;
        this.editorStore.updateComponent(component, {
          position: [position[0] + evt.delta.x, position[1] + evt.delta.y],
        });
      });
    },
    onDraggableEnd(evt) {
      this.historyStore.endGroup();

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    onResizableMove(evt) {
      const position = this.component.position;

      this.editorStore.updateComponent(this.component, {
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
    getComponentFromDragEvent(evt) {
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
        switch (this.component.type) {
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
        const droppedComponent = this.getComponentFromDragEvent(evt);
        switch (droppedComponent.type) {
          case "Page":
            break;

          default: {
            const { left, top } = this.$el.getBoundingClientRect();
            droppedComponent.position = [
              Math.round(evt.clientX - left),
              Math.round(evt.clientY - top),
            ];
          }
        }

        const component = await this.editorStore.addComponent(
          droppedComponent,
          this.component
        );
        this.editorStore.selectComponent(component);

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
  &:not(.preview) {
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
          outline: 1px solid $color;
          box-shadow: 0 0 0.25em 0.25em $color;
        } @else if $component == page {
          &.#{$component} {
            outline: 1px solid $color;
            box-shadow: inset 0 0 0.25em 0.25em $color;
          }
        } @else {
          &.#{$component} {
            outline: 1px solid $color;
            box-shadow: 0 0 0.25em 0.25em $color;
          }
        }
      }
    }

    &.drag-over {
      box-shadow: inset 0px 0px 1em 0.25em rgba(0, 0, 0, 0.75);
    }
  }
}
</style>
