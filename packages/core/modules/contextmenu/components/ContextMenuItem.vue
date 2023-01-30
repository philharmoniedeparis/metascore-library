<template>
  <li
    :class="[
      'context-menu-item',
      { 'has-handler': item.handler, 'has-subitems': item.items?.length },
    ]"
    @mouseover="onMouseover"
    @mouseleave="onMouseleave"
    @mousedown.prevent
  >
    <button type="button" @click="onClick">
      {{ item.label }}
    </button>

    <ul v-if="hover" ref="submenu" :style="submenuStyle">
      <context-menu-item
        v-for="(subitem, index) in item.items"
        :key="index"
        :item="subitem"
        @click="onSubitemClick"
      />
    </ul>
  </li>
</template>

<script>
import { computePosition, offset, flip, shift } from "@floating-ui/dom";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  emits: ["click"],
  data() {
    return {
      hover: false,
      submenuStyle: null,
    };
  },
  watch: {
    hover(value) {
      if (value) {
        this.$nextTick(function () {
          this.updateSubmenuPosition();
        });
      }
    },
  },
  methods: {
    updateSubmenuPosition() {
      computePosition(this.$el, this.$refs.submenu, {
        placement: "right-start",
        middleware: [offset(-20), flip(), shift()],
      }).then(({ x, y }) => {
        this.submenuStyle = {
          left: `${x}px`,
          top: `${y}px`,
        };
      });
    },
    onMouseover() {
      if (this.item.items?.length) {
        this.hover = true;
      }
    },
    onMouseleave() {
      if (this.item.items?.length) {
        this.hover = false;
      }
    },
    onClick() {
      if (this.item.handler) {
        this.item.handler();
        this.$emit("click");
      }
    },
    onSubitemClick() {
      this.$emit("click");
    },
  },
};
</script>

<style lang="scss" scoped>
.context-menu-item {
  position: relative;

  button {
    width: 100%;
    text-align: left;
    padding: 0.5em;
    color: var(--color-white);
    white-space: nowrap;
    user-select: none;
    box-sizing: border-box;
    cursor: default;
    opacity: 1;
  }

  ul {
    position: absolute;
    z-index: 1;
  }

  &.has-handler,
  &.has-subitems {
    &:hover {
      background: var(--color-bg-secondary);
    }
  }

  &.has-handler {
    button {
      cursor: pointer;
    }
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
}
</style>
