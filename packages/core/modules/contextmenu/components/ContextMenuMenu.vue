<template>
  <ul>
    <li v-if="$slots.header" class="header">
      <slot name="header" />
    </li>

    <li
      v-for="(item, index) in items"
      :key="index"
      :class="{
        'has-handler': item.handler,
        'has-subitems': item.items?.length,
      }"
    >
      <floating-vue placement="right-start" :container="container" instant-move>
        <a v-if="item.handler" @mousedown.prevent @click="onItemClick(item)">
          {{ item.label }}
        </a>
        <div v-else>
          {{ item.label }}
        </div>

        <template #popper>
          <context-menu-menu
            v-if="item.items?.length"
            :items="item.items"
            :container="container"
          />
        </template>
      </floating-vue>
    </li>

    <li v-if="$slots.footer" class="footer">
      <slot name="footer" />
    </li>
  </ul>
</template>

<script>
import useStore from "../store";
import { Menu as FloatingVue } from "floating-vue";

export default {
  components: {
    FloatingVue,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    container: {
      type: [String, HTMLElement, Boolean],
      required: true,
    },
  },
  emits: ["focus", "blur"],
  setup() {
    const store = useStore();
    return { store };
  },
  methods: {
    onItemClick(item) {
      if (item.handler) {
        item.handler();
        this.store.close();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
ul {
  display: flex;
  flex-direction: column;
  min-width: 150px;
  margin: 0;
  padding: 0.25em;
  list-style: none;
  color: $white;
}

li {
  position: relative;
  white-space: nowrap;
  user-select: none;

  a {
    display: block;
    padding: 0.5em;
    color: $white;
  }

  ul {
    z-index: 1;
  }

  &:not(.has-handler) {
    padding: 0.5em;
  }

  &.has-handler,
  &.has-subitems {
    &:hover {
      background: $mediumgray;
    }
  }

  &.has-handler {
    cursor: pointer;
  }

  &.has-subitems {
    padding-right: 2em;

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      right: 0.5em;
      width: 0;
      height: 0;
      margin-top: -0.1em;
      border-color: transparent transparent transparent #fff;
      border-style: solid;
      border-width: 0.35em 0 0.35em 0.35em;
      transform: translateY(-50%);
      opacity: 0.5;
    }
  }

  &:not(:last-child) {
    border-bottom: 1px solid $mediumgray;
  }
}
</style>
