<template>
  <div
    v-show="show"
    class="context-menu"
    tabindex="-1"
    :style="style"
    @contextmenu.stop.prevent
    @blur="onBlur"
    @keyup="onKeyup"
  >
    <ul>
      <li v-if="$slots.header" class="header">
        <slot name="header" />
      </li>

      <context-menu-item
        v-for="(item, index) in items"
        :key="index"
        :item="item"
        @click="onItemClick"
      />

      <li v-if="$slots.footer" class="footer">
        <slot name="footer" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, type CSSProperties } from "vue"
import { computePosition, flip, shift } from "@floating-ui/dom";
import useStore from "../store";
import ContextMenuItem from "./ContextMenuItem.vue";

export default defineComponent ({
  components: {
    ContextMenuItem,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Object as PropType<{x: number, y: number}>,
      required: true,
    },
  },
  emits: ["update:show"],
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      style: {} as CSSProperties,
    };
  },
  computed: {
    items() {
      return this.store.items;
    },
  },
  watch: {
    show(value) {
      if (value) {
        this.$nextTick(function () {
          this.updatePosition();
          this.$el.focus();
        });
      } else {
        this.store.clear();
      }
    },
  },
  methods: {
    close() {
      this.$emit("update:show", false);
    },
    // eslint-disable-next-line vue/no-unused-properties
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: this.position.x,
        y: this.position.y,
        top: this.position.y,
        left: this.position.x,
        right: this.position.x,
        bottom: this.position.y,
      };
    },
    updatePosition() {
      computePosition(this, this.$el, {
        placement: "right-start",
        middleware: [flip(), shift()],
      }).then(({ x, y }) => {
        this.style = {
          left: `${x}px`,
          top: `${y}px`,
        };
      });
    },
    onItemClick() {
      this.close();
    },
    onBlur() {
      this.close();
    },
    onKeyup(evt: KeyboardEvent) {
      if (evt.key === "Escape") {
        this.close();
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.context-menu {
  position: absolute;
  max-width: 20em;
  font-size: 0.975em;
  z-index: 9999;
  outline: none;

  :deep(ul) {
    list-style: none;
    margin: 0;
    padding: 0.25em;
    border: 1px solid var(--metascore-color-bg-primary, #777);
    background: var(--metascore-color-bg-tertiary, #3f3f3f);
    box-shadow: 0.25em 0.25em 0.5em 0 rgba(0, 0, 0, 0.5);

    li {
      margin: 0;
      padding: 0;
    }
  }

  .header,
  .footer {
    padding: 0.5em;
    color: var(--metascore-color-text-tertiary, white);
    opacity: 0.5;
  }
  .header {
    &:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    }
  }
  .footer {
    &:not(:first-child) {
      border-top: 1px solid rgba(255, 255, 255, 0.5);
    }
  }
}
</style>
