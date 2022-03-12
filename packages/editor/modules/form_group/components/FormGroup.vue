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

    <div v-if="$slots.description || description" class="description">
      <slot v-if="$slots.description" name="description" />
      <template v-else>{{ description }} </template>
    </div>
    <template v-if="validation">
      <div v-for="error of validation.$errors" :key="error.$uid" class="errors">
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

    > label {
      color: $white;
      font-weight: normal;
      white-space: nowrap;
      margin-right: 0.75em;
      user-select: none;
    }
  }

  &.checkbox,
  &.radio {
    .input-wrapper {
      flex-direction: row;
      align-items: baseline;

      > label {
        margin-right: 0;
        margin-left: 0.75em;
      }
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
