<template>
  <div @contextmenu="onContextmenu">
    <slot />

    <div
      v-if="open"
      ref="menu"
      class="context-menu"
      tabindex="0"
      :style="style"
      @contextmenu.prevent
      @blur="hide"
    >
      <context-menu-menu
        v-if="items.length"
        :items="items"
        @click:handler="hide"
      >
        <template v-if="$slots.header" #header>
          <slot name="header" />
        </template>

        <template v-if="$slots.footer" #footer>
          <slot name="footer" />
        </template>
      </context-menu-menu>
    </div>
  </div>
</template>

<script>
import useContextmenu from "../composables/useContextmenu";
import ContextMenuMenu from "./ContextMenuMenu.vue";

export default {
  components: {
    ContextMenuMenu,
  },
  setup() {
    return {
      ...useContextmenu(),
    };
  },
  data() {
    return {
      open: false,
      position: {
        x: 0,
        y: 0,
      },
    };
  },
  computed: {
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
      this.open = false;
      this.reset();
    },
    show() {
      this.open = true;
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
}
</style>
