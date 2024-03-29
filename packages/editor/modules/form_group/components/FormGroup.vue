<template>
  <div :class="['form-group', { required, error: errors?.length }]">
    <div class="input-wrapper">
      <template v-if="labelPosition === 'after'">
        <span v-if="prefix" class="prefix">{{ prefix }}</span>
        <slot />
        <span v-if="suffix" class="suffix">{{ suffix }}</span>
      </template>
      <template v-if="label">
        <label v-dompurify-html="label" :for="labelFor" />
      </template>
      <template v-else-if="$slots.label">
        <label :for="labelFor">
          <slot name="label" />
        </label>
      </template>
      <template v-if="labelPosition === 'before'">
        <span v-if="prefix" class="prefix">{{ prefix }}</span>
        <slot />
        <span v-if="suffix" class="suffix">{{ suffix }}</span>
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
    prefix: {
      type: String,
      default: null,
    },
    suffix: {
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
      color: var(--metascore-color-white);
      font-weight: normal;
      white-space: nowrap;
      user-select: none;

      &[for] {
        cursor: pointer;
      }
    }

    :deep(input),
    :deep(select),
    :deep(timecode-input)::part(input) {
      width: 100%;
      padding: 0.3125em;
      color: var(--metascore-color-white);
      font-family: inherit;
      background: var(--metascore-color-bg-secondary);
      line-height: normal;
      border: 1px solid var(--metascore-color-bg-secondary);
      border-radius: 0.25em;
      box-sizing: border-box;

      &:focus,
      &:active,
      &:focus-visible {
        outline: 1px solid var(--metascore-color-bg-primary);
        border-color: var(--metascore-color-bg-primary);
      }
    }

    :deep(timecode-input) {
      display: block;
    }
  }

  .description {
    font-size: 0.9em;
    margin-top: 0.25em;
    margin-bottom: 0.4em;
    color: var(--metascore-color-white);
    opacity: 0.75;
  }

  .errors {
    display: flex;
    flex-direction: row;
    font-size: 0.875em;
    margin-top: 0.25em;

    .icon {
      display: block;
      width: 1em;
      height: 1em;
      margin-right: 0.5em;
      color: var(--metascore-color-danger);
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      color: var(--metascore-color-white);
      opacity: 0.75;
    }
  }

  &.required {
    :deep(label) {
      &::after {
        content: "*";
        font-size: 1.25em;
        padding-left: 0.25em;
      }
    }
  }

  &.disabled {
    opacity: 0.5;
  }

  &.error {
    :deep(input),
    :deep(select) {
      outline: 2px solid var(--metascore-color-danger);
      outline-offset: -2px;
    }
  }
}
</style>
