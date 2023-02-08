<i18n>
{
  "fr": {
    "option_label": "Révision {id} du {date}",
    "restore_button": "Restaurer",
    "confirm_text": "Êtes-vous sûr de vouloir revenir à la révision {id} du {date} ?",
  },
  "en": {
    "option_label": "Revision {id} from {date}",
    "restore_button": "Restore",
    "confirm_text": "Are you sure you want to revert to revision {id} from {date}?",
  },
}
</i18n>

<template>
  <div :class="['revision-selector', { disabled }]">
    <select-control
      v-model="internalValue"
      :options="options"
      :disabled="disabled"
    />

    <base-button
      type="button"
      :disabled="disabled || !canRestore"
      @click="onRestoreClick"
    >
      {{ $t("restore_button") }}
    </base-button>

    <confirm-dialog
      v-if="showConfirm"
      @submit="onConfirmSubmit"
      @cancel="onConfirmCancel"
    >
      <p>{{ $t("confirm_text", { id: active, date: activeDate }) }}</p>
    </confirm-dialog>
  </div>
</template>

<script>
export default {
  props: {
    revisions: {
      type: Array,
      required: true,
    },
    latest: {
      type: [String, Number],
      default: null,
    },
    active: {
      type: [String, Number],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dateFormatter: {
      type: Object,
      default() {
        return new Intl.DateTimeFormat(void 0, {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        });
      },
      validator(value) {
        return "format" in value;
      },
    },
  },
  emits: ["update:active", "restore"],
  data() {
    return {
      showConfirm: false,
    };
  },
  computed: {
    options() {
      return this.revisions.map((revision) => {
        return {
          label: this.$t("option_label", {
            id: revision.vid,
            date: this.dateFormatter.format(new Date(revision.created * 1000)),
          }),
          value: revision.vid,
          disabled: revision.vid === this.active,
        };
      });
    },
    internalValue: {
      get() {
        return this.active;
      },
      set(value) {
        this.$emit("update:active", value);
      },
    },
    canRestore() {
      return this.active && this.active !== this.latest;
    },
    activeDate() {
      if (!this.active) {
        return null;
      }

      const revision = this.revisions.find((r) => r.vid === this.active);
      return this.dateFormatter.format(new Date(revision.created * 1000));
    },
  },
  methods: {
    onRestoreClick() {
      this.showConfirm = true;
    },
    onConfirmSubmit() {
      this.showConfirm = false;
      this.$emit("restore", this.active);
    },
    onConfirmCancel() {
      this.showConfirm = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.revision-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;

  :deep(select) {
    max-width: 15em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  :deep(button) {
    padding: 0 1em;
    color: var(--metascore-color-bg-tertiary);
    background: var(--metascore-color-white);
    border: 1px solid var(--metascore-color-white);
    border-radius: 1.5em;
  }
}
</style>
