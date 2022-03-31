<i18n>
{
  "fr": {
    "option_label": "Révision {id} du {date}",
    "restore_button": "Restaurer",
  },
  "en": {
    "option_label": "Revision {id} from {date}",
    "restore_button": "Restore",
  },
}
</i18n>

<template>
  <div class="revision-selector">
    <select-control v-model="active" :options="options" />

    <styled-button
      type="button"
      :disabled="!canRestore"
      @click="onRestoreClick"
    >
      {{ $t("restore_button") }}
    </styled-button>
  </div>
</template>

<script>
import useStore from "../store";

export default {
  props: {
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
  emits: ["update:modelValue"],
  setup() {
    const store = useStore();
    return { store };
  },
  computed: {
    latest() {
      return this.store.latest;
    },
    options() {
      return this.store.list.reduce((acc, revision) => {
        const label = this.$t("option_label", {
          id: revision.vid,
          date: this.dateFormatter.format(new Date(revision.created * 1000)),
        });

        return {
          ...acc,
          [label]: {
            value: revision.vid,
            disabled: revision.vid === this.active,
          },
        };
      }, {});
    },
    active: {
      get() {
        return this.store.active;
      },
      set(value) {
        this.store.active = value;
      },
    },
    canRestore() {
      return this.active && this.active !== this.latest;
    },
  },
  methods: {
    onRestoreClick() {},
  },
};
</script>

<style lang="scss" scoped>
.revision-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;

  ::v-deep(select) {
    max-width: 15em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  ::v-deep(button) {
    background: $white;
    border: 1px solid $white;
    border-radius: 1.5em;
  }
}
</style>
