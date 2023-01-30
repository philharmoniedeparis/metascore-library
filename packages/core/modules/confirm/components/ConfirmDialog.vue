<i18n>
{
  "fr": {
    "submit_button": "OK",
    "cancel_button": "Annuler",
  },
  "en": {
    "submit_button": "OK",
    "cancel_button": "Cancel",
  },
}
</i18n>

<template>
  <base-modal class="confirm-dialog" @close="$emit('cancel')">
    <div class="text">
      <slot v-if="$slots.default" />
      <template v-else>{{ text }}</template>
    </div>

    <template #footer>
      <base-button type="button" role="primary" @click="$emit('submit')">
        {{ submitLabelWithDefault }}
      </base-button>

      <base-button type="button" role="secondary" @click="$emit('cancel')">
        {{ cancelLabelWithDefault }}
      </base-button>
    </template>
  </base-modal>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: null,
    },
    submitLabel: {
      type: String,
      default: null,
    },
    cancelLabel: {
      type: String,
      default: null,
    },
  },
  emits: ["submit", "cancel"],
  computed: {
    submitLabelWithDefault() {
      return this.submitLabel ?? this.$t("submit_button");
    },
    cancelLabelWithDefault() {
      return this.cancelLabel ?? this.$t("cancel_button");
    },
  },
};
</script>

<style scoped lang="scss">
.confirm-dialog {
  .text {
    color: var(--color-white);
  }
}
</style>
