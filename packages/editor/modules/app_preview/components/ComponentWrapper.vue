<i18n>
{
  "fr": {
    "contextmenu": {
      "page_before": "Add a page before",
      "page_after": "Add a page after",
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
    },
    "errors": {
      "add_sibling_page_time": "Dans un bloc synchronisé, une page ne peut pas être insérée au temps de début ou de fin d’une page existante.<br/><b>Veuillez vous déplacer dans le média avant d’insérer une nouvelle page.</b>",
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
    },
    "errors": {
      "add_sibling_page_time": "In a synchronized block, a page cannot be inserted at the start or end time of an existing page.<br/><b>Please move the media to a different time before inserting a new page.</b>",
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
      frozen,
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

    <alert-dialog v-if="error" @close="error = null">
      <p v-dompurify-html="error"></p>
    </alert-dialog>
  </default-component-wrapper>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import { useModule } from "@metascore-library/core/services/module-manager";
import {
  default as useStore,
  ValidationError,
  ADD_SIBLING_PAGE_TIME_ERROR,
} from "../store";

export default {
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
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
    const { getData: getClipboardData, setData: setClipboardData } =
      useModule("clipboard");
    const { time: mediaTime } = useModule("media_player");
    const {
      getModelByType,
      getModelByMime,
      getComponentChildrenProperty,
      getComponentChildren,
      getComponentSiblings,
      getComponentParent,
      createComponent,
      addComponent,
      updateComponent,
      deleteComponent,
      getBlockActivePage,
      setBlockActivePage,
    } = useModule("app_components");
    const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
      useModule("history");
    return {
      store,
      getClipboardData,
      setClipboardData,
      mediaTime,
      getModelByType,
      getModelByMime,
      getComponentChildrenProperty,
      getComponentChildren,
      getComponentSiblings,
      getComponentParent,
      createComponent,
      addComponent,
      updateComponent,
      deleteComponent,
      getBlockActivePage,
      setBlockActivePage,
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
      error: null,
    };
  },
  computed: {
    model() {
      return this.getModelByType(this.component.type);
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
    frozen() {
      return this.store.isComponentFrozen(this.component);
    },
    interactable() {
      return (
        (this.model.$isPositionable || this.model.$isResizable) &&
        this.selected &&
        !this.preview &&
        !this.locked &&
        !this.disableComponentInteractions
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
    activeSnapTargets: {
      get() {
        return this.store.activeSnapTargets;
      },
      set(value) {
        this.store.activeSnapTargets = value;
      },
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

      const paste_target = this.store.getClosestPasteTarget(this.component);
      if (paste_target) {
        items.push({
          label: this.$t("contextmenu.paste"),
          handler: async () => {
            await this.store.pasteComponents(paste_target);
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

        default:
          items.push(
            {
              label: this.$t("contextmenu.copy"),
              handler: () => {
                this.store.copyComponents([this.component]);
              },
            },
            {
              label: this.$t("contextmenu.cut"),
              handler: async () => {
                await this.store.cutComponents([this.component]);
              },
            }
          );

          return [
            {
              label: `${this.component.type} (${this.component.name})`,
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
                        await this.store.arrangeComponent(
                          this.component,
                          "front"
                        );
                      },
                    },
                    {
                      label: this.$t("contextmenu.to_back"),
                      handler: async () => {
                        await this.store.arrangeComponent(
                          this.component,
                          "back"
                        );
                      },
                    },
                    {
                      label: this.$t("contextmenu.forward"),
                      handler: async () => {
                        await this.store.arrangeComponent(
                          this.component,
                          "forward"
                        );
                      },
                    },
                    {
                      label: this.$t("contextmenu.backward"),
                      handler: async () => {
                        await this.store.arrangeComponent(
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
    interactable(value) {
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
      if (this._interactables) return;

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
        this.activeSnapTargets = [];
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
        this.activeSnapTargets.push(target);
      }

      return target;
    },
    onDraggableStart() {
      this.dragging = true;
      this.startHistoryGroup({ coalesce: true });
    },
    async onDraggableMove(evt) {
      this.startHistoryGroup();
      for (const component of this.store.getSelectedComponents) {
        const position = component.position;
        await this.updateComponent(component, {
          position: [position[0] + evt.delta.x, position[1] + evt.delta.y],
        });
      }
      this.endHistoryGroup();
    },
    onDraggableEnd(evt) {
      this.dragging = false;
      this.activeSnapTargets = [];
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
      this.startHistoryGroup({ coalesce: true });
    },
    async onResizableMove(evt) {
      const position = this.component.position;

      await this.updateComponent(this.component, {
        position: [
          position[0] + evt.deltaRect.left,
          position[1] + evt.deltaRect.top,
        ],
        dimension: [evt.rect.width, evt.rect.height],
      });
    },
    onResizableEnd(evt) {
      this.resizing = false;
      this.activeSnapTargets = [];
      this.endHistoryGroup();

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    getModelFromDragEvent(evt) {
      const mime = evt.dataTransfer.types.find((type) => {
        return type.startsWith("metascore/component;type=");
      });
      return mime ? this.getModelByMime(mime) : null;
    },
    isDropAllowed(evt) {
      const model = this.getModelFromDragEvent(evt);

      if (model) {
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
      const model = this.getModelFromDragEvent(evt);
      if (model) {
        let data = evt.dataTransfer.getData(model.mime);
        if (data) {
          data = JSON.parse(data);

          switch (data.type) {
            case "Page":
              break;

            default: {
              const { left, top } = this.$el.getBoundingClientRect();
              data.position = [evt.clientX - left, evt.clientY - top];
            }
          }
          return await this.createComponent(data);
        }
      }
    },
    async addDroppedComponent(evt) {
      this.startHistoryGroup();

      const dropped_component = await this.getComponentFromDragEvent(evt);
      let component = null;

      switch (dropped_component.type) {
        case "Page":
          {
            const pages = this.getComponentChildren(this.component);
            const index = this.getBlockActivePage(this.component);
            component = await this.addSiblingPage(
              pages[index],
              "after",
              dropped_component
            );
            if (component) {
              this.setBlockActivePage(this.component, index + 1);
            }
          }
          break;

        case "Block":
          {
            component = await this.addComponent(
              dropped_component,
              this.component
            );
            const page = await this.createComponent({ type: "Page" });
            await this.addComponent(page, component);
          }
          break;

        default:
          component = await this.addComponent(
            dropped_component,
            this.component
          );
      }

      if (component) {
        this.store.selectComponent(component);
      }

      this.endHistoryGroup(!component);
    },
    async addSiblingPage(page, position, data) {
      try {
        return await this.store.addSiblingPage(page, position, data);
      } catch (e) {
        if (e instanceof ValidationError) {
          switch (e.code) {
            case ADD_SIBLING_PAGE_TIME_ERROR:
              this.error = this.$t("errors.add_sibling_page_time");
              break;
            default:
              console.error(e);
          }
        } else {
          console.error(e);
        }
      }
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

    &.block-toggler {
      :deep(button) {
        pointer-events: none;
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
