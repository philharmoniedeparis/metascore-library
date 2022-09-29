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
  <default-component-wrapper
    v-contextmenu="contextmenuItems"
    :component="component"
    :class="{
      selected,
      locked,
      preview,
      dragging,
      resizing,
      'drag-over': dragOver,
    }"
    @click="onClick"
    @dragenter="onDragenter"
    @dragover="onDragover"
    @dragleave="onDragleave"
    @drop="onDrop"
  >
    <slot />

    <template v-if="resizable" #outer>
      <div class="resize-handle top left"></div>
      <div class="resize-handle top"></div>
      <div class="resize-handle top right"></div>
      <div class="resize-handle right"></div>
      <div class="resize-handle bottom right"></div>
      <div class="resize-handle bottom"></div>
      <div class="resize-handle bottom left"></div>
      <div class="resize-handle left"></div>
    </template>
  </default-component-wrapper>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { round, omit, kebabCase, startCase, camelCase } from "lodash";
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
    const {
      format: clipboardFormat,
      data: clipboardData,
      setData: setClipboardData,
    } = useModule("clipboard");
    const { time: mediaTime } = useModule("media_player");
    const {
      getModel,
      getComponentChildren,
      getComponentSiblings,
      createComponent,
      addComponent,
      updateComponent,
      deleteComponent,
      getBlockActivePage,
    } = useModule("app_components");
    const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
      useModule("history");
    return {
      store,
      clipboardFormat,
      clipboardData,
      setClipboardData,
      mediaTime,
      getModel,
      getComponentChildren,
      getComponentSiblings,
      createComponent,
      addComponent,
      updateComponent,
      deleteComponent,
      getBlockActivePage,
      startHistoryGroup,
      endHistoryGroup,
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
      return this.getModel(this.component.type);
    },
    preview() {
      return this.store.preview;
    },
    selected() {
      return this.store.isComponentSelected(this.component);
    },
    locked() {
      return this.store.isComponentLocked(this.component);
    },
    interactable() {
      return (
        !this.disableComponentInteractions &&
        !this.preview &&
        !this.locked &&
        this.selected
      );
    },
    positionable() {
      return this.interactable && this.model.$isPositionable;
    },
    resizable() {
      return this.interactable && this.model.$isResizable;
    },
    siblings() {
      return this.getComponentSiblings(this.component);
    },
    snapTargets: {
      get() {
        return this.store.snapTargets;
      },
      set(value) {
        this.store.snapTargets = value;
      },
    },
    clipboardDataAvailable() {
      if (this.clipboardFormat !== "metascore/component") {
        return false;
      }

      const component = this.clipboardData;

      switch (this.component.type) {
        case "Scenario":
        case "Page":
          return this.model.schema.properties[
            "children"
          ].items.properties.type.enum.includes(component.type);
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
              this.store.deselectComponent(this.component);
            } else {
              this.store.selectComponent(this.component);
            }
          },
        },
        {
          label: this.$t(`contextmenu.${this.locked ? "un" : ""}lock`),
          handler: () => {
            if (this.locked) {
              this.store.unlockComponent(this.component);
            } else {
              this.store.lockComponent(this.component);
            }
          },
        },
      ];

      if (this.clipboardDataAvailable) {
        items.push({
          label: this.$t("contextmenu.paste"),
          handler: () => {
            // @todo
            const data = this.clipboardData;
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
                    this.deleteComponent(this.component);
                  },
                },
                {
                  label: this.$t("contextmenu.page_before"),
                  handler: () => {
                    this.store.addPageBefore(this.component);
                  },
                },
                {
                  label: this.$t("contextmenu.page_after"),
                  handler: () => {
                    this.store.addPageAfter(this.component);
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
              this.setClipboardData(`metascore/component`, data);
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
                    this.deleteComponent(this.component);
                  },
                },
                {
                  label: this.$t("contextmenu.arrange"),
                  items: [
                    {
                      label: this.$t("contextmenu.to_front"),
                      handler: () => {
                        this.store.arrangeComponent(this.component, "front");
                      },
                    },
                    {
                      label: this.$t("contextmenu.to_back"),
                      handler: () => {
                        this.store.arrangeComponent(this.component, "back");
                      },
                    },
                    {
                      label: this.$t("contextmenu.forward"),
                      handler: () => {
                        this.store.arrangeComponent(this.component, "forward");
                      },
                    },
                    {
                      label: this.$t("contextmenu.backward"),
                      handler: () => {
                        this.store.arrangeComponent(this.component, "backward");
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
    locked(value) {
      if (value) {
        this.destroyInteractions();
      } else {
        this.setupInteractions();
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

      evt.stopPropagation();

      if (this.selected) {
        if (evt.shiftKey) {
          this.store.deselectComponent(this.component);
          evt.stopImmediatePropagation();
        }
      } else {
        this.store.selectComponent(this.component, evt.shiftKey);
        evt.stopImmediatePropagation();
      }
    },
    setupInteractions() {
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
            modifiers: [
              interact.modifiers.restrict({
                // Using "parent" as "restriction" produces an
                // "invalid 'instanceof' operand iS.SVGElement"
                // error in production builds.
                restriction: () => {
                  return this.$el.parentElement.getBoundingClientRect();
                },
                elementRect: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5 },
              }),
              interact.modifiers.snap({
                targets: [this.getInteractableSnapTarget],
                relativePoints: [
                  { x: 0, y: 0 },
                  { x: 0.5, y: 0.5 },
                  { x: 1, y: 1 },
                ],
              }),
            ],
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
            modifiers: [
              interact.modifiers.snap({
                targets: [this.getInteractableSnapTarget],
              }),
            ],
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
    getInteractableSnapTarget(x, y, interaction, relativePoint) {
      let min_distance = { x: this.snapRange, y: this.snapRange };
      let target = null;

      if (relativePoint.index === 0) {
        this.snapTargets = [];
      }

      this.siblings.forEach((sibling) => {
        if (this.store.isComponentSelected(sibling)) {
          return;
        }

        const [left, top] = sibling.position;
        const [width, height] = sibling.dimension;

        [left, (left + width) / 2, left + width].forEach((value) => {
          const distance = Math.abs(value - x);
          if (distance <= min_distance.x) {
            min_distance.x = distance;
            target = { ...(target ?? {}), x: value };
          }
        });

        [top, (top + height) / 2, top + height].forEach((value) => {
          const distance = Math.abs(value - y);
          if (distance <= min_distance.y) {
            min_distance.y = distance;
            target = { ...(target ?? {}), y: value };
          }
        });
      });

      if (target) {
        this.snapTargets.push(target);
      }

      return target;
    },
    onDraggableStart() {
      this.dragging = true;
      this.startHistoryGroup();
    },
    onDraggableMove(evt) {
      this.store.getSelectedComponents.forEach((component) => {
        const position = component.position;
        this.updateComponent(component, {
          position: [
            round(position[0] + evt.delta.x),
            round(position[1] + evt.delta.y),
          ],
        });
      });
    },
    onDraggableEnd(evt) {
      this.dragging = false;
      this.snapTargets = [];
      this.endHistoryGroup();

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

      this.updateComponent(this.component, {
        position: [
          round(position[0] + evt.deltaRect.left),
          round(position[1] + evt.deltaRect.top),
        ],
        dimension: [round(evt.rect.width), round(evt.rect.height)],
      });
    },
    onResizableEnd(evt) {
      this.resizing = false;
      this.snapTargets = [];

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    getModelFromDragEvent(evt) {
      let type = null;
      evt.dataTransfer.types.some((format) => {
        const matches = format.match(/^metascore\/component:(.*)$/);
        if (matches) {
          type = startCase(camelCase(matches[1])).replace(" ", "");
          return true;
        }
      });
      return type ? this.getModel(type) : null;
    },
    isDropAllowed(evt) {
      const model = this.getModelFromDragEvent(evt);

      if (model.type) {
        switch (this.component.type) {
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
      let model = this.getModelFromDragEvent(evt);
      if (model) {
        // Some browsers transform the DataTransfer format to lowercase.
        // Force it to kebab case to insure compatibility with other browsers.
        const type = kebabCase(model.type);

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
          return await this.createComponent(data);
        }
      }
    },
    async addDroppedComponent(evt) {
      const droppedComponent = await this.getComponentFromDragEvent(evt);

      let index = null;
      switch (droppedComponent.type) {
        case "Page":
          index = this.getBlockActivePage(this.component) + 1;
          break;
      }

      const component = await this.addComponent(
        droppedComponent,
        this.component,
        index
      );

      switch (component.type) {
        case "Block":
          {
            const page = await this.createComponent({ type: "Page" });
            await this.addComponent(page, component);
          }
          break;
        case "Page":
          if (this.component.synched) {
            const pages = this.getComponentChildren(this.component);
            const previous = pages[index - 1];
            const next = pages[index + 1];

            if (previous || next) {
              const data = {};

              if (previous) data["start-time"] = round(this.mediaTime, 2);
              if (next) data["end-time"] = next["start-time"];

              await this.updateComponent(droppedComponent, data);
            }
          }
          break;
      }

      this.store.selectComponent(component);
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
      &:hover > :deep(.metaScore-component--inner .pager) {
        display: flex !important;
      }
    }

    &.content {
      > :deep(.metaScore-component--inner) {
        & > .contents {
          a {
            pointer-events: none;
          }
        }
      }

      &.sourceediting {
        > :deep(.metaScore-component--inner) {
          overflow: auto;
          z-index: 1;
        }
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

    &.locked {
      pointer-events: none;
    }
  }
}
</style>
