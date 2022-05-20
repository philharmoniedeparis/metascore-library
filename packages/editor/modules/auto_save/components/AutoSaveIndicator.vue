<i18n>
{
  "fr": {
    "indicator_text": "Sauvegarde des données de récupération ...",
  },
  "en": {
    "indicator_text": "Saving auto-recovery data...",
  },
}
</i18n>

<template>
  <keep-alive>
    <div v-if="store.saving" class="auto-save-indicator">
      {{ $t("indicator_text") }}
    </div>
  </keep-alive>
</template>

<script>
import useStore from "../store";

export default {
  props: {
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const store = useStore();
    return { store };
  },
  watch: {
    enabled(value) {
      this.store[value ? "subscribe" : "unsubscribe"]();
    },
  },
  mounted() {
    if (this.enabled) {
      this.store.subscribe();
    }
  },
  beforeUnmount() {
    if (this.enabled) {
      this.store.unsubscribe();
    }
  },
  methods: {
    save() {
      this.store.save();
    },
    delete() {
      this.store.delete();
    },
  },
};
</script>

<style lang="scss" scoped>
.auto-save-indicator {
  padding: 0.25em 0.5em;
  font-size: 0.9em;
  color: $white;
  background: $darkgray;
  pointer-events: none;
}
</style>
