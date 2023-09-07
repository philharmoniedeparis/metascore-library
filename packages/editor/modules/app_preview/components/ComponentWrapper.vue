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
      "delete_keyframes": "Supprimer toutes les positions",
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
      "delete_keyframes": "Delete all positions",
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
      frozen,
      'drag-over': dragOver,
    }"
    tabindex="0"
    @mousedown="onMousedown"
    @focus="onFocus"
    @click="onClick"
    @dragenter="onDragenter"
    @dragover="onDragover"
    @dragleave="onDragleave"
    @drop="onDrop"
  >
    <slot />

    <template v-if="selected" #outer>
      <div
        v-for="point in [
          'top left',
          'top right',
          'bottom right',
          'bottom left',
        ]"
        :key="point"
        ref="controlbox-ref-points"
        :class="`controlbox-ref-point ${point}`"
      ></div>
    </template>

    <teleport v-if="selected && controlBoxTarget" :to="controlBoxTarget">
      <div
        v-show="visibleInViewport"
        ref="controlbox"
        :class="['component-wrapper--controlbox', kebabCase(component.type)]"
      >
        <!-- eslint-disable-next-line vue/require-v-for-key, vue/no-unused-vars -->
        <div v-for="n in 4" ref="controlbox-edges" class="edge"></div>

        <template v-if="interactable">
          <template v-if="transformable">
            <div class="rotate">
              <div ref="controlbox-rotate-line" class="line"></div>
              <div ref="controlbox-rotate-handle" class="handle"></div>
            </div>
          </template>
          <template v-if="resizable">
            <div
              v-for="corner in [
                'top left',
                'top',
                'top right',
                'right',
                'bottom right',
                'bottom',
                'bottom left',
                'left',
              ]"
              :key="corner"
              ref="controlbox-resize-handles"
              :class="`resize-handle ${corner}`"
            ></div>
          </template>
        </template>
      </div>
    </teleport>

    <alert-dialog v-if="error" @close="error = null">
      <p v-dompurify-html="error"></p>
    </alert-dialog>
  </default-component-wrapper>
</template>

<script>
import { computed } from "vue";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { round, kebabCase } from "lodash";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import { useModule } from "@metascore-library/core/services/module-manager";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";
import {
  default as useStore,
  ValidationError,
  ADD_SIBLING_PAGE_TIME_ERROR,
} from "../store";

export default {
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  provide() {
    return {
      controlBoxLastUpdated: computed(() => this.controlBoxLastUpdated),
    };
  },
  inject: {
    gridStep: {
      default: 10,
    },
    snapToGrid: {
      default: false,
    },
    snapToSiblings: {
      default: true,
    },
    snapRange: {
      default: 5,
    },
    disableInteractions: {
      from: "disableComponentInteractions",
      default: false,
    },
    parentControlBoxLastUpdated: {
      from: "controlBoxLastUpdated",
      default: 0,
    },
  },
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
      getComponentLabel,
      createComponent,
      addComponent,
      updateComponent,
      deleteComponent,
      getBlockActivePage,
      setBlockActivePage,
    } = useModule("app_components");
    const { getComponentElement } = useModule("app_renderer");
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
      getComponentLabel,
      createComponent,
      addComponent,
      updateComponent,
      deleteComponent,
      getBlockActivePage,
      setBlockActivePage,
      getComponentElement,
      startHistoryGroup,
      endHistoryGroup,
    };
  },
  data() {
    return {
      visibleInViewport: true,
      controlBoxLastUpdated: 0,
      dragOver: false,
      dragEnterCounter: 0,
      error: null,
    };
  },
  computed: {
    controlBoxTarget() {
      return this.store.controlboxContainer;
    },
    model() {
      return this.getModelByType(this.component.type);
    },
    preview() {
      return this.store.preview;
    },
    zoom() {
      return this.store.zoom;
    },
    selected() {
      return !this.preview && this.store.isComponentSelected(this.component);
    },
    locked() {
      return this.store.isComponentLocked(this.component);
    },
    frozen() {
      return this.store.isComponentFrozen(this.component);
    },
    positionable() {
      return this.model.$isPositionable;
    },
    resizable() {
      return this.model.$isResizable;
    },
    transformable() {
      return this.model.$isTransformable;
    },
    interactable() {
      return (
        (this.positionable || this.resizable || this.transformable) &&
        this.selected &&
        !this.locked &&
        !this.disableInteractions
      );
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
    roundedMediaTime() {
      return round(this.mediaTime, 2);
    },
    currentScale() {
      if (this.component.scale?.animated) {
        return getAnimatedValueAtTime(
          this.component.scale.value,
          this.mediaTime
        );
      }
      return this.component.scale?.value;
    },
    currentTranslate() {
      if (this.component.translate?.animated) {
        return getAnimatedValueAtTime(
          this.component.translate.value,
          this.mediaTime
        );
      }
      return this.component.translate?.value;
    },
    currentRotation() {
      if (this.component.rotate?.animated) {
        return getAnimatedValueAtTime(
          this.component.rotate.value,
          this.mediaTime
        );
      }
      return this.component.rotate?.value;
    },
    contextmenuItems() {
      if (this.preview) return [];

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
          const type = this.$t(`app_components.labels.${this.component.type}`);
          const name = this.getComponentLabel(this.component);

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
            },
            {
              label: this.$t("contextmenu.delete"),
              handler: async () => {
                await this.deleteComponent(this.component);
              },
            }
          );

          if (
            this.component.type === "Cursor" &&
            this.component.keyframes &&
            this.component.keyframes.length > 0
          ) {
            items.push({
              label: this.$t("contextmenu.delete_keyframes"),
              handler: async () => {
                await this.updateComponent(this.component, { keyframes: [] });
              },
            });
          }

          items.push({
            label: this.$t("contextmenu.arrange"),
            items: [
              {
                label: this.$t("contextmenu.to_front"),
                handler: async () => {
                  await this.store.arrangeComponent(this.component, "front");
                },
              },
              {
                label: this.$t("contextmenu.to_back"),
                handler: async () => {
                  await this.store.arrangeComponent(this.component, "back");
                },
              },
              {
                label: this.$t("contextmenu.forward"),
                handler: async () => {
                  await this.store.arrangeComponent(this.component, "forward");
                },
              },
              {
                label: this.$t("contextmenu.backward"),
                handler: async () => {
                  await this.store.arrangeComponent(this.component, "backward");
                },
              },
            ],
          });

          return [
            {
              label: `${type} (<i>${name}</i>)`,
              items,
            },
          ];
        }
      }
    },
  },
  watch: {
    selected() {
      this.updateControlBox();
    },
    interactable(value) {
      if (value) {
        this.setupInteractions();
      } else {
        this.destroyInteractions();
      }
    },
    "component.position"() {
      this.updateControlBox();
    },
    "component.dimension"() {
      this.updateControlBox();
    },
    "component.scale"() {
      this.updateControlBox();
    },
    "component.translate"() {
      this.updateControlBox();
    },
    currentScale() {
      this.updateControlBox();
    },
    currentTranslate() {
      this.updateControlBox();
    },
    currentRotation() {
      this.updateControlBox();
    },
    parentControlBoxLastUpdated() {
      this.updateControlBox();
    },
  },
  beforeUnmount() {
    this.destroyInteractions();
  },
  methods: {
    kebabCase,
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

      this.store.selectComponent(this.component);
    },
    onClick(evt) {
      if (this.preview) return;

      delete this._skipFocus;
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
    async setupInteractions() {
      if (!this.interactable || this._interactables) return;

      await this.$nextTick();

      this._interactables = [];

      if (this.positionable) {
        const interactable = interact(this.$el, {
          context: this.$el.ownerDocument,
        });

        let allowFrom = null;

        switch (this.component.type) {
          case "Block":
            allowFrom = ".pager";
            break;
          case "Controller":
            allowFrom = ".timer";
            break;
        }

        interactable.draggable({
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

        this._interactables.push(interactable);
      }

      if (this.resizable || this.transformable) {
        const interactable = interact(this.$refs.controlbox, {
          context: this.$el.ownerDocument,
        });

        if (this.resizable) {
          interactable.resizable({
            edges: {
              top: ".resize-handle.top",
              right: ".resize-handle.right",
              bottom: ".resize-handle.bottom",
              left: ".resize-handle.left",
            },
            invert: "negate",
            modifiers: [
              interact.modifiers.snapEdges({
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

        if (this.transformable) {
          interactable.draggable({
            allowFrom: ".rotate .handle",
            cursorChecker() {
              return "grab";
            },
            listeners: {
              start: this.onRotateStart,
              move: this.onRotateMove,
              end: this.onRotateEnd,
            },
          });
        }

        this._interactables.push(interactable);
      }

      this._intersection_observer = new IntersectionObserver(
        (entries) => {
          this.visibleInViewport = entries[0].isIntersecting;
        },
        { root: this.$el.ownerDocument, threshold: 0 }
      );
      this._intersection_observer.observe(this.$el);

      await this.updateControlBox();
    },
    destroyInteractions() {
      if (this._interactables) {
        this._interactables.map((interactable) => interactable.unset());
        delete this._interactables;
      }

      if (this._intersection_observer) {
        this._intersection_observer.disconnect();
        delete this._intersection_observer;
      }
    },
    async updateControlBox() {
      if (!this.selected) return;

      await this.$nextTick();

      // Calculate ref points with offset.
      const offset = this.controlBoxTarget.getBoundingClientRect();
      const ref_points = this.$refs["controlbox-ref-points"].map((point) => {
        const rect = point.getBoundingClientRect();
        return ["x", "y", "left", "right", "top", "bottom"].reduce(
          (acc, prop) => {
            return {
              ...acc,
              [prop]: (rect[prop] - offset[prop]) / this.zoom,
            };
          },
          { ...rect }
        );
      });

      // Update edges.
      ref_points.forEach((p1, i, points) => {
        const p2 = points[(i + 1) % points.length];
        const length = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );
        const center = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        };
        const angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);

        const edge = this.$refs["controlbox-edges"][i];
        edge.style.left = `${center.x - length / 2}px`;
        edge.style.top = `${center.y}px`;
        edge.style.width = `${length}px`;
        edge.style.transform = `rotate(${angle}rad)`;
      });

      if (this.interactable) {
        if (this.resizable) {
          // Update resize handles.
          this.$refs["controlbox-resize-handles"].forEach((handle, i) => {
            if (i % 2 === 1) {
              const p1_index = (i - 1) / 2;
              const p1 = ref_points[p1_index];
              const p2_index = (p1_index + 1) % ref_points.length;
              const p2 = ref_points[p2_index];
              handle.style.top = `${(p1.top + p2.top) / 2}px`;
              handle.style.left = `${(p1.left + p2.left) / 2}px`;
            } else {
              const p = ref_points[Math.floor(i / 2)];
              handle.style.top = `${p.top}px`;
              handle.style.left = `${p.left}px`;
            }
          });
        }

        if (this.transformable) {
          const p1 = ref_points[0];
          const p2 = ref_points[1];
          const length = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
          );
          const center = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
          };
          const distance = 20;
          const pos = {
            x: center.x - (distance * (p1.y - center.y)) / (length / 2),
            y: center.y + (distance * (p1.x - center.x)) / (length / 2),
          };

          // Update rotate line.
          const line_center = {
            x: (center.x + pos.x) / 2,
            y: (center.y + pos.y) / 2,
          };
          const angle = Math.atan2(center.y - pos.y, center.x - pos.x);
          const line = this.$refs["controlbox-rotate-line"];
          line.style.left = `${line_center.x - distance / 2}px`;
          line.style.top = `${line_center.y}px`;
          line.style.width = `${distance}px`;
          line.style.transform = `rotate(${angle}rad)`;

          // Update rotate handle.
          const handle = this.$refs["controlbox-rotate-handle"];
          handle.style.top = `${pos.y}px`;
          handle.style.left = `${pos.x}px`;
        }
      }

      this.controlBoxLastUpdated = performance.now();
    },
    getInteractableSnapTarget(x, y, interaction, relativePoint) {
      let target = null;
      let min_distance = { x: this.snapRange, y: this.snapRange };

      if (!relativePoint?.index) {
        this.activeSnapTargets = [];
      }

      if (this.snapToGrid && !relativePoint?.index) {
        const step = this.gridStep * this.zoom;
        ["x", "y"].forEach((axis) => {
          const offset =
            this.store.appRendererWrapperRect[axis] +
            this.store.appPreviewEl[axis === "y" ? "scrollTop" : "scrollLeft"];
          const closest =
            Math.round(((axis === "y" ? y : x) - offset) / step) * step +
            offset;
          const distance = Math.abs(closest - (axis === "y" ? y : x));
          if (distance <= min_distance[axis]) {
            min_distance[axis] = distance;
            target = {
              ...(target ?? {}),
              [axis]: closest,
            };
          }
        });
      }

      if (this.snapToSiblings) {
        this.siblings.forEach((sibling) => {
          if (this.store.isComponentSelected(sibling)) {
            return;
          }

          const sibling_el = this.getComponentElement(sibling);
          const { left, top, width, height } =
            sibling_el.getBoundingClientRect();

          [left, (left + width) / 2, left + width].forEach((value) => {
            const distance = Math.abs(value - x);
            if (distance <= min_distance.x) {
              min_distance.x = distance;
              target = {
                ...(target ?? {}),
                x: value,
              };
            }
          });

          [top, (top + height) / 2, top + height].forEach((value) => {
            const distance = Math.abs(value - y);
            if (distance <= min_distance.y) {
              min_distance.y = distance;
              target = {
                ...(target ?? {}),
                y: value,
              };
            }
          });
        });
      }

      if (target) {
        this.activeSnapTargets.push(target);
      }

      return target;
    },
    onDraggableStart() {
      this.startHistoryGroup({ coalesce: true });
    },
    async onDraggableMove(evt) {
      this.startHistoryGroup();
      for (const component of this.store.getSelectedComponents) {
        const position = component.position;
        await this.updateComponent(component, {
          position: [
            position[0] + evt.delta.x / this.zoom,
            position[1] + evt.delta.y / this.zoom,
          ],
        });
      }
      this.endHistoryGroup();
    },
    onDraggableEnd(evt) {
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
      this.startHistoryGroup({ coalesce: true });
    },
    async onResizableMove(evt) {
      const { position, dimension } = this.component;

      await this.updateComponent(this.component, {
        position: [
          position[0] + evt.deltaRect.left / this.zoom,
          position[1] + evt.deltaRect.top / this.zoom,
        ],
        dimension: [
          dimension[0] + evt.deltaRect.width / this.zoom,
          dimension[1] + evt.deltaRect.height / this.zoom,
        ],
      });
    },
    onResizableEnd(evt) {
      this.activeSnapTargets = [];
      this.endHistoryGroup();

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    onRotateStart(evt) {
      this.startHistoryGroup({ coalesce: true });
      this._rotate_prev_angle = this.getRotateAngle(evt);
    },
    async onRotateMove(evt) {
      const angle = this.getRotateAngle(evt);
      const prev_angle = this._rotate_prev_angle;

      const diff = round(angle - prev_angle);
      let { animated, value } = this.component.rotate;

      if (animated) {
        const time = this.roundedMediaTime;
        const index = value.findIndex((v) => v[0] === time);
        if (index >= 0) {
          const new_value = value[index][1] + diff;
          value = [
            ...value.slice(0, index),
            [time, new_value],
            ...value.slice(index + 1),
          ];
        } else {
          const new_value = round(
            getAnimatedValueAtTime(value, this.mediaTime) + diff
          );
          value = value.concat([[time, new_value]]).sort((a, b) => a[0] - b[0]);
        }
      } else {
        value += diff;
      }

      await this.updateComponent(this.component, {
        rotate: { animated, value },
      });

      this._rotate_prev_angle = angle;
    },
    onRotateEnd(evt) {
      this.endHistoryGroup();
      delete this._rotate_prev_angle;

      // Prevent the next click event
      evt.target.addEventListener(
        "click",
        (evt) => evt.stopImmediatePropagation(),
        { capture: true, once: true }
      );
    },
    getRotateAngle(evt) {
      const { left, top, width, height } = this.$el.getBoundingClientRect();
      const center = {
        x: left + width / 2,
        y: top + height / 2,
      };
      return (
        Math.atan2(center.y - evt.clientY, center.x - evt.clientX) *
        (180 / Math.PI)
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
@import "@metascore-library/editor/scss/variables";

.metaScore-component {
  &:not(.preview) {
    touch-action: none;
    user-select: none;

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

    &.drag-over {
      box-shadow: inset 0px 0px 1em 0.25em var(--metascore-color-accent);
    }

    &.locked {
      pointer-events: none;
    }
  }

  .controlbox-ref-point {
    position: absolute;
    width: 0px;
    height: 0px;
    pointer-events: none;

    &.top {
      top: 0;
    }
    &.bottom {
      bottom: 0;
    }
    &.left {
      left: 0;
    }
    &.right {
      right: 0;
    }
  }
}

.component-wrapper--controlbox {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;

  @each $component, $color in $component-colors {
    @if $component == default {
      --color: var(--metascore-color-component-#{$component});
    } @else {
      &.#{$component} {
        --color: var(--metascore-color-component-#{$component});
      }
    }
  }

  .edge {
    position: absolute;
    height: 1px;
    border-top: 3px dotted var(--color);
    transform-origin: 50% 0;
  }

  .rotate {
    position: absolute;
    pointer-events: all;

    .line {
      position: absolute;
      height: 1px;
      margin-left: -1px;
      border-top: 3px dotted var(--color);
    }

    .handle {
      position: absolute;
      width: 0.5em;
      height: 0.5em;
      margin-left: -0.25em;
      margin-top: -0.25em;
      background: var(--metascore-color-white);
      outline: 2px solid var(--color);
      border-radius: 50%;
    }
  }

  .resize-handle {
    position: absolute;
    width: 0.5em;
    height: 0.5em;
    margin-top: -0.25em;
    margin-left: -0.25em;
    background: var(--color);
    border-radius: 50%;
    pointer-events: all;
  }
}
</style>
