<i18n>
{
  "fr": {
    "synched_block": "Bloc synchronisé",
    "non_synched_block": "Bloc non-synchronisé",
    "page": "Page",
    "cursor": "Élément curseur",
    "content": "Élément contenu",
    "controller": "Contrôleur",
    "video_renderer": "Rendu vidéo",
    "block_toggler": "Contrôleur de blocs",
  },
  "en": {
    "synched_block": "Synchronized block",
    "non_synched_block": "Non-synchronized block",
    "page": "Page",
    "cursor": "Cursor element",
    "content": "Content element",
    "controller": "Controller",
    "video_renderer": "Video renderer",
    "block_toggler": "Block Toggler",
  },
}
</i18n>

<template>
  <ul class="components-library">
    <li v-for="(model, index) in models" :key="index" class="item">
      <component-icon :model="model" />
      <div class="label">{{ $t(model.name) || model.name }}</div>
    </li>
  </ul>
</template>

<script>
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/modifiers";
import "@interactjs/pointer-events";
import interact from "@interactjs/interact";
import { mapGetters } from "vuex";

export default {
  props: {
    modelConfigs: {
      type: Array,
      default() {
        return [
          {
            type: "Block",
            name: "synched_block",
            synched: true,
          },
          {
            type: "Block",
            name: "non_synched_block",
            synched: false,
          },
          {
            type: "Page",
            name: "page",
            position: "before",
          },
          {
            type: "Cursor",
            name: "cursor",
          },
          {
            type: "Content",
            name: "content",
          },
          {
            type: "Controller",
            name: "controller",
          },
          {
            type: "VideoRenderer",
            name: "video_renderer",
          },
          {
            type: "BlockToggler",
            name: "block_toggler",
          },
        ];
      },
    },
  },
  computed: {
    ...mapGetters("app-components", {
      createModel: "create",
    }),
    models() {
      return this.modelConfigs.map(this.createModel);
    },
  },
  mounted() {
    this.$nextTick(function () {
      this._interactable = interact(".item").draggable({
        context: this.$el,
        listeners: {
          start: this.onItemDragStart,
          move: this.onItemDrag,
          end: this.onItemDragEnd,
        },
      });
    });
  },
  beforeUnmount() {
    if (this._interactable) {
      this._interactable.unset();
      delete this._interactable;
    }
  },
  methods: {
    onItemDragStart(evt) {
      const { target } = evt;

      target.classList.add("dragging");
      target.setAttribute("data-drag-x", 0);
      target.setAttribute("data-drag-y", 0);
    },
    onItemDrag(evt) {
      const { target, dx, dy } = evt;
      const x = parseFloat(target.getAttribute("data-drag-x")) + dx;
      const y = parseFloat(target.getAttribute("data-drag-y")) + dy;

      target.setAttribute("data-drag-x", x);
      target.setAttribute("data-drag-y", y);
      target.style.transform = `translateX(${x}px) translateY(${y}px)`;
    },
    onItemDragEnd(evt) {
      const { target } = evt;

      target.classList.remove("dragging");
      target.removeAttribute("data-drag-x");
      target.removeAttribute("data-drag-y");
      target.style.transform = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.components-library {
  display: flex;
  position: relative;
  flex-direction: column;
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;

  .item {
    display: flex;
    flex: 0 0 2em;
    flex-direction: row;
    align-items: center;
    padding: 0.25em;
    background-color: $lightgray;
    border-top: 1px solid $mediumgray;
    border-bottom: 1px solid $mediumgray;

    .icon {
      flex: 0 0 2em;
      height: 1.5em;
      margin-right: 0.5em;
    }

    .label {
      flex: 1 1 auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
    }

    &::before {
      content: "";
      display: inline-block;
      width: 1em;
      height: 100%;
      margin-right: 0.5em;
      background: url(../assets/icons/drag-handle.svg) 50% 50% no-repeat;
      vertical-align: middle;
      opacity: 0.5;
    }

    &:hover,
    &.dragging {
      background-color: $mediumgray;
    }
  }
}
</style>
