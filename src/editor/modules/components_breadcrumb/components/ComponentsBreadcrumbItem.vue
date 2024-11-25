<template>
  <li :class="['components-breadcrumb--item', { tail }]">
    <button v-if="typeof value === 'object'" type="button" :disabled="tail" @click="onComponentClick(value)">
      {{ getComponentLabel(value) }}
    </button>
    <div v-else>
      {{ value }}
    </div>
  </li>
</template>

<script>
import { useModule } from "@core/services/module-manager";

export default {
  props: {
    value: {
      type: [Object, String],
      required: true,
    },
    tail: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { getComponentLabel } = useModule("app_components");
    const { selectComponent } = useModule("app_preview");
    return { getComponentLabel, selectComponent };
  },
  methods: {
    onComponentClick(component) {
      this.selectComponent(component);
    },
  },
};
</script>

<style lang="scss" scoped>
.components-breadcrumb--item {
  margin-right: 0.5em;
  font-size: 0.75em;
  color: var(--metascore-color-text-primary);

  &::after {
    content: "›";
    margin-left: 0.5em;
    opacity: 0.75;
  }

  &.tail {
    color: var(--metascore-color-text-secondary);

    &::after {
      display: none;
    }
  }

  div,
  button {
    max-width: 10em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  div {
    display: inline-block;
    vertical-align: middle;
  }

  button {
    padding: 0;
    color: inherit;
    background: none;
    border: none;

    &:hover {
      color: var(--metascore-color-text-secondary);
    }
  }
}
</style>
