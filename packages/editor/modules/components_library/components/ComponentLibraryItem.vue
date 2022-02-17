<template>
  <div
    :class="['component-library-item', { dragging }]"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <component-icon :model="model" :label="label" />
    <div class="label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dragging: false,
    };
  },
  computed: {
    dragData() {
      const data = this.model.toJson();
      delete data.id;
      return JSON.stringify(data);
    },
  },
  methods: {
    onItemMousemove(evt) {
      const interaction = evt.interaction;
      const interactable = evt.interactable;

      // If the pointer was moved while being held down
      // and an interaction hasn't started yet
      if (interaction.pointerIsDown && !interaction.interacting()) {
        const target = evt.currentTarget;

        // Create and insert the clone.
        const { left, top, width, height } = interactable.getRect(target);
        const clone = target.cloneNode(true);
        clone.classList.add("dragging");
        clone.style.left = `${left}px`;
        clone.style.top = `${top}px`;
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;
        target.parentNode.appendChild(clone);

        // Start the drag interaction targeting the clone
        interaction.start({ name: "drag" }, evt.interactable, clone);
      }
    },
    onDragStart(evt) {
      evt.dataTransfer.effectAllowed = "copy";
      evt.dataTransfer.setData(`metascore/component`, this.dragData);

      this.dragging = true;
    },
    onDragEnd() {
      this.dragging = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.component-library-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5em;
  background-color: $lightgray;
  border-top: 1px solid $mediumgray;
  border-bottom: 1px solid $mediumgray;
  box-sizing: border-box;
  cursor: grab;

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

  &.dragging {
    opacity: 0.5;
  }
}
</style>
