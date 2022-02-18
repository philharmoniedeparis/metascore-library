<template>
  <ul v-if="items.length">
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
      <a v-if="item.handler" @click="onItemClick(item)">
        {{ item.label }}
      </a>
      <span v-else>
        {{ item.label }}
      </span>

      <context-menu-menu
        v-if="item.items?.length"
        :items="item.items"
        @click:handler="$emit('click:handler')"
      />
    </li>

    <li v-if="$slots.footer" class="footer">
      <slot name="footer" />
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  emits: ["click:handler"],
  methods: {
    onItemClick(item) {
      if (item.handler) {
        item.handler();
        this.$emit("click:handler");
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
  background: $darkgray;
  color: $white;
  box-shadow: 0.25em 0.25em 0.5em 0 rgba(0, 0, 0, 0.5);
  border: 1px solid $lightgray;
}

li {
  position: relative;
  padding: 0.5em;
  white-space: nowrap;
  user-select: none;

  a {
    display: block;
  }

  ul {
    position: absolute;
    top: -1em;
    left: 100%;
    margin-left: -1em;
    z-index: 1;
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

  &:not(:hover) {
    ul {
      display: none;
    }
  }

  &:not(:last-child) {
    border-bottom: 1px solid $mediumgray;
  }
}
</style>
