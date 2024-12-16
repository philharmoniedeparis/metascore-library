<template>
  <div :class="[
    'split-button',
    { expanded, 'has-secondary-actions': $slots['secondary-actions'] },
  ]" @click="onClick">
    <slot></slot>
    <base-button class="split-button--toggle" @click.stop="toggle">
      <template #icon><expander-icon /></template>
    </base-button>
    <div class="split-button--secondary-actions">
      <slot name="secondary-actions"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { v4 as uuid } from "uuid";
import ExpanderIcon from "../assets/icons/expander.svg?component";

export default defineComponent ({
  components: {
    ExpanderIcon,
  },
  props: {
    type: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      toggleId: `split-button--${uuid()}`,
      expanded: false,
    };
  },
  mounted() {
    this.$el.ownerDocument.addEventListener(
      "mousedown",
      this.onDocumentMousedown,
      true
    );
  },
  beforeUnmount() {
    this.$el.ownerDocument.removeEventListener(
      "mousedown",
      this.onDocumentMousedown,
      true
    );
  },
  methods: {
    toggle() {
      this.expanded = !this.expanded;
    },
    onClick() {
      this.expanded = false;
    },
    onDocumentMousedown(evt) {
      if (!this.$el.contains(evt.target)) {
        this.expanded = false;
      }
    },
  },
});
</script>

<style scoped lang="scss">
.split-button {
  position: relative;
  display: flex;
  color: var(--metascore-color-white, white);
  border-radius: 2px;
  z-index: 999;

  :deep(.base-button) {
    padding: 0.5em 1em;
    border-radius: 0;
    line-height: 2em;
  }

  &--toggle {
    border-left: 1px solid currentColor;
    padding: 0 0.25em;

    :deep(.icon) {
      width: 0.75em;
      height: 0.75em;
      margin: 0 0.25em;
      transform-origin: center;
      transition: transform 0.3s cubic-bezier(0.5, 0.25, 0, 1);
    }
  }

  &--secondary-actions {
    position: absolute;
    top: 100%;
    left: 50%;
    display: flex;
    background: var(--metascore-color-bg-secondary);
    border-radius: 2px;
    transform: translateX(-50%);
    overflow: hidden;

    > :not(:last-child) {
      border-bottom: 1px solid currentColor;
    }
  }

  &.expanded &--toggle {
    .icon {
      transform: rotate(180deg);
    }
  }

  &:not(.has-secondary-actions) &--toggle,
  &:not(.has-secondary-actions) &--secondary-actions,
  &:not(.expanded) &--secondary-actions {
    display: none;
  }
}
</style>
