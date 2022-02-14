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
      <label :for="labelFor">
        <template v-if="label">{{ label }}</template>
        <template v-else><slot name="label" /></template>
      </label>
      <template v-if="label_position === 'before'">
        <slot />
      </template>
    </div>

    <div v-if="$slots.description || description" class="description">
      <slot v-if="$slots.description" name="description" />
      <template v-else>{{ description }} </template>
    </div>
    <template v-if="validation">
      <div
        v-for="(error, index) of validation.$errors"
        :key="index"
        class="errors"
      >
        <div class="error-msg">{{ error.$message }}</div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "text",
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
    flex-direction: column;
    align-items: stretch;
  }

  ::v-deep(label) {
    color: $white;
  }

  &.required {
    ::v-deep(label) {
      &::after {
        content: "*";
      }
    }
  }

  &.text {
    ::v-deep(input) {
      min-width: 15em;
      padding: 0.3125em;
      line-height: 2em;
      color: $white;
      background: $mediumgray;
      border: 1px solid $mediumgray;
      border-radius: 0.25em;

      &:focus,
      &:active,
      &:focus-visible {
        outline: 1px solid $lightgray;
        border-color: $lightgray;
      }
    }

    ::v-deep(label) {
      align-self: flex-start;
      white-space: nowrap;
    }

    &.error {
      ::v-deep(label) {
        color: #dd201f;
      }

      &.text {
        ::v-deep(input) {
          border-color: #dd201f;
        }
      }
    }
  }

  &.checkbox,
  &.radio {
    align-self: center;

    .input-wrapper {
      flex-direction: row;
      align-items: baseline;
    }

    ::v-deep(label) {
      font-weight: normal;
    }

    ::v-deep(input) {
      margin: 0.15em 0.5em 0 0;
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
