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
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore();
    return { store };
  },
  watch: {
    disabled(value) {
      this.store[value ? "unsubscribe" : "subscribe"]();
    },
  },
  mounted() {
    this.store.subscribe();
  },
  beforeUnmount() {
    this.store.unsubscribe();
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
