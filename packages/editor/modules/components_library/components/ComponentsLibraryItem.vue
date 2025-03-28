<template>
  <div
    :class="['components-library--item', { dragging }]"
    draggable="true"
    @dragstart="onDragstart"
    @dragend="onDragend"
  >
    <component-icon :component="component" :label="label" />
    <div class="label">{{ label }}</div>
  </div>
</template>

<script>
import { omit } from "lodash";
import { useModule } from "@core/services/module-manager";

export default {
  props: {
    component: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { getModelByType } = useModule("app_components");
    return { getModelByType };
  },
  data() {
    return {
      dragging: false,
    };
  },
  methods: {
    onDragstart(evt) {
      const data = omit(this.component, ["id"]);
      const model = this.getModelByType(data.type);

      evt.dataTransfer.effectAllowed = "copy";
      evt.dataTransfer.setData(model.mime, JSON.stringify(data));

      this.dragging = true;
    },
    onDragend() {
      this.dragging = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.components-library--item {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 2.5em;
  padding: 0.25em;
  background-color: var(--metascore-color-bg-primary);
  border-top: 1px solid var(--metascore-color-bg-secondary);
  border-bottom: 1px solid var(--metascore-color-bg-secondary);
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
    background-color: var(--metascore-color-bg-secondary);
  }

  &.dragging {
    opacity: 0.5;
  }
}
</style>
