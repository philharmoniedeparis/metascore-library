<template>
  <div
    v-if="isShown"
    class="context-menu"
    :style="style"
    @contextmenu.prevent
    @mousedown.stop
  >
    <div v-if="$slots.header" class="header">
      <slot name="header" />
    </div>
    <ul v-if="items.length">
      <template v-for="(item, index) in items" :key="index">
        <li @click="onItemClick(item)">{{ item.label }}</li>
      </template>
    </ul>
    <div v-if="$slots.footer" class="footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  computed: {
    ...mapState("contextmenu", ["isShown", "target", "items", "position"]),
    style() {
      return {
        left: `${this.position.x}px`,
        top: `${this.position.y}px`,
      };
    },
  },
  watch: {
    target(value, oldValue) {
      if (oldValue) {
        const window = oldValue.ownerDocument.defaultView;
        window.removeEventListener("mousedown", this.hide);
        window.removeEventListener("blur", this.hide);
        window.removeEventListener("keyup", this.onWindowKeyup);
      }
      if (value) {
        const window = value.ownerDocument.defaultView;
        window.addEventListener("mousedown", this.hide);
        window.addEventListener("blur", this.hide);
        window.addEventListener("keyup", this.onWindowKeyup);
      }
    },
  },
  methods: {
    ...mapMutations("contextmenu", ["hide"]),
    onItemClick(item) {
      if (item.handler) {
        item.handler(this.target);
        this.hide();
      }
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
  top: 100px;
  left: 200px;
  padding: 0.25em 0.1em;
  background: $darkgray;
  color: $white;
  box-shadow: 0.25em 0.25em 0.5em 0 rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 999;

  .header,
  .footer {
    padding: 0.2em 0.5em;
  }

  .footer:not(:first-child) {
    border-top: 1px solid rgba(0, 0, 0, 0.25);
  }

  ul {
    display: flex;
    flex-direction: column;
    min-width: 150px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    position: relative;
    padding: 0.2em 0.5em;
    white-space: nowrap;

    &:not(:last-child) {
      border-bottom: 1px solid rgba(0, 0, 0, 0.25);
    }
  }
}
</style>
