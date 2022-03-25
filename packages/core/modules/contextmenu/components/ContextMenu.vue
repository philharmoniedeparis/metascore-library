<template>
  <div @contextmenu="onContextmenu">
    <slot />

    <div
      v-if="isOpen"
      ref="menu"
      class="context-menu"
      tabindex="0"
      :style="style"
      @contextmenu.prevent
      @blur="hide"
    >
      <floating-vue
        placement="bottom-start"
        strategy="fixed"
        :shown="true"
        :container="false"
        :handle-resize="false"
        @apply-hide="hide"
      >
        <div></div>

        <template #popper>
          <context-menu-menu
            v-if="items.length || $slots.header || $slots.footer"
            :items="items"
          >
            <template v-if="$slots.header" #header>
              <slot name="header" />
            </template>

            <template v-if="$slots.footer" #footer>
              <slot name="footer" />
            </template>
          </context-menu-menu>
        </template>
      </floating-vue>
    </div>
  </div>
</template>

<script>
import useStore from "../store";
import { Menu as FloatingVue } from "floating-vue";
import ContextMenuMenu from "./ContextMenuMenu.vue";
import "@metascore-library/editor/scss/_floating-vue.scss";

export default {
  components: {
    FloatingVue,
    ContextMenuMenu,
  },
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      position: {
        x: 0,
        y: 0,
      },
    };
  },
  computed: {
    isOpen() {
      return this.store.isOpen;
    },
    items() {
      return this.store.items;
    },
    style() {
      return {
        left: `${this.position.x}px`,
        top: `${this.position.y}px`,
      };
    },
  },
  mounted() {
    window.addEventListener("keyup", this.onWindowKeyup);
  },
  beforeUnmount() {
    window.removeEventListener("keyup", this.onWindowKeyup);
  },
  methods: {
    hide() {
      this.store.close();
    },
    show() {
      this.store.open();
      this.$nextTick(function () {
        this.$refs.menu.focus();
      });
    },
    onContextmenu(evt) {
      // Show the native menu if the Ctrl key is down.
      if (evt.ctrlKey) {
        return;
      }

      this.position = {
        x: evt.pageX,
        y: evt.pageY,
      };

      this.show();

      evt.preventDefault();
    },
    onWindowKeyup(evt) {
      if (evt.key === "Escape") {
        this.hide();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.context-menu {
  position: fixed;
  z-index: 999;
  outline: none;

  ::v-deep(.v-popper__inner) {
    background: $darkgray;
    border: 1px solid $lightgray;
    box-shadow: 0.25em 0.25em 0.5em 0 rgba(0, 0, 0, 0.5);
  }

  ::v-deep(.v-popper__arrow-container) {
    display: none;
  }
}
</style>
