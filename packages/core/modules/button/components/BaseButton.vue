<template>
  <button :type="type" :disabled="disabled" :class="[
    'base-button',
    role,
    { 'has-icon': $slots.icon, 'has-content': $slots.default, loading },
  ]">
    <i v-if="$slots.icon" class="icon">
      <slot name="icon" />
    </i>
    <span v-if="$slots.default" class="content">
      <slot />
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent ({
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
});
</script>

<style scoped lang="scss">
.base-button {
  position: relative;
  width: max-content;
  display: inline-flex;
  padding: 0.5em 2em;
  flex-direction: row;
  align-items: center;
  color: var(--metascore-color-white, white);
  background: none;
  border: none;
  border-radius: 2px;
  opacity: 0.5;
  text-align: center;
  font-size: 1em;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &:focus,
  &:active,
  &:focus-visible {
    outline: 1px solid var(--metascore-color-accent, #0000fe);
    border: none;
  }

  &:disabled {
    cursor: default;
    pointer-events: none;
    opacity: 0.25;
  }

  &.primary {
    background-color: var(--metascore-color-white, white);

    &:hover,
    &:active {
      color: var(--metascore-color-white, white);
      background-color: var(--metascore-color-bg-primary, #777);
    }
  }

  &.secondary {
    background-color: var(--metascore-color-bg-tertiary, #3f3f3f);

    &:hover,
    &:active {
      color: var(--metascore-color-white, white);
      background-color: var(--metascore-color-bg-primary, #777);
    }
  }

  &.danger {
    color: #fff;
    background-color: #cd2453;

    &:hover,
    &:active {
      background-color: #b9204a;
    }
  }

  &.no-bg {
    background: none;
  }

  &.no-border {
    border: none;
  }

  :deep(*) {
    pointer-events: none;
  }

  .icon {
    display: flex;
    width: 1em;
    height: 1em;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  &.has-icon {
    &:not(.has-content) {
      justify-content: center;
      padding: 0.5em;
    }

    &.has-content {
      .icon {
        margin-right: 0.5em;
      }
    }
  }

  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }

  &.loading {
    pointer-events: none;

    .icon,
    .content {
      visibility: hidden;
    }

    &::after {
      content: "";
      position: absolute;
      left: 50%;
      width: 1.25em;
      height: 1.25em;
      margin-left: -0.625em;
      visibility: visible;
      border: 0.2em solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      box-sizing: border-box;
      animation: spinner 0.75s linear infinite;
    }
  }
}
</style>
