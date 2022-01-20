<template>
  <player-component-wrapper
    :model="model"
    :class="{ selected }"
    @click.stop="onClick"
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
import PlayerComponentWrapper from "../../../player/app_components/components/ComponentWrapper";

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
  computed: {
    ...mapGetters(["isComponentSelected"]),
    selected() {
      return this.isComponentSelected(this.model);
    },
  },
  watch: {
    selected(value) {
      if (value && (this.model.$isPositionable || this.model.$isResizable)) {
        this._interactable = interact(this.$el, {
          context: this.$el.ownerDocument,
        });

        if (this.model.$isPositionable) {
          this._interactable.draggable({
            listeners: {
              move: this.onDrag,
              end: this.onDragEnd,
            },
          });
        }

        if (this.model.$isResizable) {
          this._interactable.resizable({
            edges: { top: true, left: true, bottom: true, right: true },
            listeners: {
              move: this.onResize,
            },
          });
        }
      } else if (this._interactable) {
        this._interactable.unset();
        delete this._interactable;
      }
    },
  },
  beforeUnmount() {
    if (this._interactable) {
      this._interactable.unset();
      delete this._interactable;
    }
  },
  methods: {
    ...mapMutations([
      "selectComponent",
      "deselectComponent",
      "deselectAllComponents",
    ]),
    ...mapActions(["updateComponent"]),
    onClick(evt) {
      const model = this.model;

      if (this.isComponentSelected(model)) {
        if (evt.shiftKey) {
          this.deselectComponent({ model });
        }
      } else {
        if (!evt.shiftKey) {
          this.deselectAllComponents();
        }

        this.selectComponent({ model });
      }
    },
    onDrag(evt) {
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
}
</style>
