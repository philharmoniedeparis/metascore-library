<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'styled-button',
      role,
      { 'has-icon': $slots.icon, 'has-content': $slots.default, loading },
    ]"
  >
    <i v-if="$slots.icon" class="icon">
      <slot name="icon" />
    </i>
    <span v-if="$slots.default" class="content">
      <slot />
    </span>
  </button>
</template>

<script>
export default {
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
};
</script>

<style scoped lang="scss">
.styled-button {
  position: relative;
  width: max-content;
  display: inline-flex;
  padding: 0.5em 2em;
  flex-direction: row;
  align-items: center;
  color: $white;
  border: none;
  border-radius: 2px;
  text-align: center;
  font-size: 1em;
  font-family: "SourceSansPro", "Source-Sans-Pro", "Source Sans Pro", sans-serif;
  cursor: pointer;

  &:focus,
  &:active,
  &:focus-visible {
    outline: 1px solid $metascore-color;
    border: none;
  }

  &:disabled {
    cursor: default;
    pointer-events: none;
    opacity: 0.25;
  }

  &.primary {
    background-color: $white;

    &:hover,
    &:active {
      color: $white;
      background-color: $darkgray;
    }
  }

  &.secondary {
    background-color: $lightgray;

    &:hover,
    &:active {
      color: $white;
      background-color: $darkgray;
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

  ::v-deep(*) {
    pointer-events: none;
  }

  .icon {
    display: flex;
    width: 1em;
    height: 1em;
    align-items: center;
    justify-content: center;

    ::v-deep(svg) {
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
