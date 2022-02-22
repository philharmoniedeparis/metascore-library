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
      <p v-if="text">{{ text }}</p>
      <slot v-else name="text" />
    </div>

    <template #footer>
      <styled-button type="button" role="primary" @click="$emit('submit')">
        {{ submitLabelWithDefault }}
      </styled-button>

      <styled-button type="button" role="secondary" @click="$emit('cancel')">
        {{ cancelLabelWithDefault }}
      </styled-button>
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
    color: $white;
  }
}
</style>
