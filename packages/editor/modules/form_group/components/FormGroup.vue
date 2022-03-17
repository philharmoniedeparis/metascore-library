<template>
  <div
    :class="[
      'form-group',
      type,
      {
        required: validation && validation.required,
        error: validation && validation.$errors.length,
      },
    ]"
  >
    <div class="input-wrapper">
      <template v-if="label_position === 'after'">
        <slot />
      </template>
      <template v-if="label || $slots.label">
        <label :for="labelFor">
          <template v-if="label">{{ label }}</template>
          <template v-else><slot name="label" /></template>
        </label>
      </template>
      <template v-if="label_position === 'before'">
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

    <template v-if="validation">
      <div v-for="error of validation.$errors" :key="error.$uid" class="errors">
        <div class="error-msg">{{ error.$message }}</div>
      </div>
    </template>
  </div>
</template>

<script>
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";

export default {
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  props: {
    type: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    labelFor: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: null,
    },
    validation: {
      type: Object,
      default: null,
    },
  },
  computed: {
    label_position() {
      return this.type === "checkbox" || this.type === "radio"
        ? "after"
        : "before";
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

  &.checkbox,
  &.radio {
    .input-wrapper {
      flex-direction: row;
      align-items: baseline;
    }
  }

  &.required {
    ::v-deep(label) {
      &::after {
        content: "*";
      }
    }
  }

  &.error {
    ::v-deep(label) {
      color: #dd201f;
    }
  }
}

.errors {
  font-size: 0.875em;
  color: #dd201f;
}

.description {
  font-size: 0.9em;
  margin-top: 0.25em;
  margin-bottom: 0.4em;
  color: $white;
  opacity: 0.75;
}
</style>
