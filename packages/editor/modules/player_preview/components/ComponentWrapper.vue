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
    v-contextmenu="contextmenuItems"
    :component="component"
    :class="{ selected, preview, dragging, resizing, 'drag-over': dragOver }"
    @click.stop="onClick"
    @dragenter="onDragenter"
    @dragover="onDragover"
    @dragleave="onDragleave"
    @drop="onDrop"
  >
    <slot />

    <template v-if="selected && resizable" #outer>
      <div class="resize-handle top left"></div>
      <div class="resize-handle top"></div>
      <div class="resize-handle top right"></div>
      <div class="resize-handle right"></div>
      <div class="resize-handle bottom right"></div>
      <div class="resize-handle bottom"></div>
      <div class="resize-handle bottom left"></div>
      <div class="resize-handle left"></div>
    </template>
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
  inject: ["disableComponentInteractions"],
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
    snapRange: {
      type: Number,
      default: 5,
    },
  },
  emits: ["componentclick"],
  setup() {
    const store = useStore();
    const editorStore = useEditorStore();
    const clipboardStore = useModule("clipboard").useStore();
    const componentsStore = useModule("app_components").useStore();
    const historyStore = useModule("history").useStore();
    return {
      store,
      editorStore,
      clipboardStore,
      componentsStore,
      historyStore,
    };
  },
  data() {
    return {
      dragOver: false,
      dragEnterCounter: 0,
      dragging: false,
      resizing: false,
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
    positionable() {
      return this.model.$isPositionable;
    },
    resizable() {
      return this.model.$isResizable;
    },
    siblings() {
      return this.componentsStore.getSiblings(this.component);
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
      } else {
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
    disableComponentInteractions(value) {
      if (value) {
        this.destroyInteractions();
      } else {
        this.setupInteractions();
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
      if (this.preview || !this.selected || this.disableComponentInteractions) {
        return;
      }

      if (this._interactables) {
        return;
      }

      if (this.positionable || this.resizable) {
        this._interactables = interact(this.$el, {
          context: this.$el.ownerDocument,
        });

        if (this.positionable) {
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

        if (this.resizable) {
          this._interactables.resizable({
            edges: {
              top: ".resize-handle.top",
              right: ".resize-handle.right",
              bottom: ".resize-handle.bottom",
              left: ".resize-handle.left",
            },
            listeners: {
              start: this.onResizableStart,
              move: this.onResizableMove,
              end: this.onResizableEnd,
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
    getInteractableSnapTargets() {
      const targets = [];
      const x_values = [];
      const y_values = [];

      const { top, left } = this.$el.getBoundingClientRect();
      const offset_x = left - this.component.position[0];
      const offset_y = top - this.component.position[1];

      this.siblings.forEach((sibling) => {
        if (this.editorStore.isComponentSelected(sibling)) {
          return;
        }

        let [left, top] = sibling.position;
        const [width, height] = sibling.dimension;
        left += offset_x;
        top += offset_y;
        x_values.push(left, left + width / 2, left + width);
        y_values.push(top, top + height / 2, top + height);
      });

      x_values.forEach((x) => {
        targets.push({ x });
        y_values.forEach((y) => {
          targets.push({ x, y });
        });
      });
      y_values.forEach((y) => {
        targets.push({ y });
      });

      return targets;
    },
    onDraggableStart() {
      this.dragging = true;
      this.historyStore.startGroup();
    },
    onDraggableMove(evt) {
      this.editorStore.getSelectedComponents.forEach((component) => {
        const position = component.position;
        this.editorStore.updateComponent(component, {
          position: [
            Math.round(position[0] + evt.delta.x),
            Math.round(position[1] + evt.delta.y),
          ],
        });
      });
    },
    onDraggableEnd(evt) {
      this.dragging = false;
      this.historyStore.endGroup();

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    onResizableStart() {
      this.resizing = true;
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
    onResizableEnd(evt) {
      this.resizing = false;

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
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
    onDrop(evt) {
      this.dragEnterCounter = 0;
      this.dragOver = false;

      if (this.isDropAllowed(evt)) {
        this.addDroppedComponent(evt);
        evt.stopPropagation();
        evt.preventDefault();
      }
    },
    async getComponentFromDragEvent(evt) {
      const type = this.getModelTypeFromDragEvent(evt);
      if (type) {
        const format = `metascore/component:${type}`;
        if (evt.dataTransfer.types.includes(format)) {
          const data = JSON.parse(evt.dataTransfer.getData(format));
          switch (data.type) {
            case "Page":
              break;

            default: {
              const { left, top } = this.$el.getBoundingClientRect();
              data.position = [
                Math.round(evt.clientX - left),
                Math.round(evt.clientY - top),
              ];
            }
          }
          return await this.editorStore.createComponent(data);
        }
      }
    },
    async addDroppedComponent(evt) {
      const droppedComponent = await this.getComponentFromDragEvent(evt);
      const component = await this.editorStore.addComponent(
        droppedComponent.$data,
        this.component
      );

      this.editorStore.selectComponent(component);
    },
  },
};
</script>

<style lang="scss" scoped>
.metaScore-component {
  &:not(.preview) {
    touch-action: none;
    user-select: none;

    .resize-handle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 1em;
      height: 1em;
      margin-top: -0.45em;
      margin-left: -0.45em;
      background: $white;
      border: 0.25em solid $metascore-color;
      box-sizing: border-box;
      z-index: 2;

      &.top {
        top: 0;
      }
      &.right {
        left: 100%;
      }
      &.bottom {
        top: 100%;
      }
      &.left {
        left: 0;
      }
    }
    @each $component, $color in $component-colors {
      @if $component == default {
        .resize-handle {
          border-color: $color;
        }
      } @else {
        &.#{$component} .resize-handle {
          border-color: $color;
        }
      }
    }

    &.block {
      &:hover::v-deep(> .metaScore-component--inner .pager) {
        display: flex !important;
      }
    }

    &.selected {
      &::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border: 0.25em dashed $metascore-color;
        pointer-events: none;
        z-index: 1;
      }

      @each $component, $color in $component-colors {
        @if $component == default {
          &:after {
            border-color: $color;
          }
        } @else if $component == page {
          &.#{$component} {
            &:after {
              border-color: $color;
            }
          }
        } @else {
          &.#{$component} {
            &:after {
              border-color: $color;
            }
          }
        }
      }
    }

    &.drag-over {
      box-shadow: inset 0px 0px 1em 0.25em $metascore-color;
    }

    &.dragging,
    &.resizing {
      z-index: 999;
    }
  }
}
</style>
