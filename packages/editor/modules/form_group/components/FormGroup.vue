<template>
  <div :class="['form-group', { required, error: errors?.length }]">
    <div class="input-wrapper">
      <template v-if="labelPosition === 'after'">
        <slot />
      </template>
      <template v-if="label || $slots.label">
        <label :for="labelFor">
          <template v-if="label">{{ label }}</template>
          <template v-else><slot name="label" /></template>
        </label>
      </template>
      <template v-if="labelPosition === 'before'">
        <slot />
      </template>
    </div>

    <div v-if="$slots.description" class="description">
      <slot v-if="$slots.description" name="description" />
    </div>
    <div
      v-else-if="description"
      v-dompurify-html="description"
      class="description"
    />

    <div v-if="errors?.length" class="errors">
      <error-icon class="icon" />
      <ul>
        <li v-for="(error, index) of errors" :key="index" class="error">
          {{ error }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import ErrorIcon from "../assets/icons/error.svg?inline";

export default {
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  components: {
    ErrorIcon,
  },
  props: {
    label: {
      type: String,
      default: null,
    },
    labelFor: {
      type: String,
      default: null,
    },
    labelPosition: {
      type: String,
      default: "before",
    },
    description: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    errors: {
      type: Array,
      default() {
        return null;
      },
    },
  },
};
</script>

<style scoped lang="scss">
.form-group {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 0.5em;

  .input-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75em;

    > label {
      color: $white;
      font-weight: normal;
      white-space: nowrap;
      user-select: none;
    }

    ::v-deep(input),
    ::v-deep(select) {
      width: 100%;
      padding: 0.3125em;
      color: $white;
      font-family: inherit;
      background: $mediumgray;
      line-height: normal;
      border: 1px solid $mediumgray;
      border-radius: 0.25em;
      box-sizing: border-box;

      &:focus,
      &:active,
      &:focus-visible {
        outline: 1px solid $lightgray;
        border-color: $lightgray;
      }
    }
  }

  .description {
    font-size: 0.9em;
    margin-top: 0.25em;
    margin-bottom: 0.4em;
    color: $white;
    opacity: 0.75;
  }

  .errors {
    display: flex;
    flex-direction: row;
    font-size: 0.875em;
    margin-top: 0.25em;

    .icon {
      color: $danger;
      width: 1em;
      height: 1em;
      margin-right: 0.5em;
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      color: $white;
      opacity: 0.75;
    }
  }

  &.required {
    ::v-deep(label) {
      &::after {
        content: "*";
        font-size: 1.25em;
        padding-left: 0.25em;
      }
    }
  }

  &.error {
    ::v-deep(input),
    ::v-deep(select) {
      outline: 2px solid $danger;
      outline-offset: -2px;
    }
  }
}
</style>
