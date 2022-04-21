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
    <div v-if="saving" class="auto-save-indicator">
      {{ $t("indicator_text") }}
    </div>
  </keep-alive>
</template>

<script>
import * as api from "../api";
import useEditorStore from "@metascore-library/editor/store";

export default {
  props: {
    url: {
      type: String,
      default: null,
    },
    interval: {
      type: Number,
      default: 30,
    },
    deleteOnUnload: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const editorStore = useEditorStore();
    return { editorStore };
  },
  data() {
    return {
      saving: false,
      timeoutId: null,
      storeUnsubscribe: null,
      lastSave: null,
    };
  },
  watch: {
    url(value) {
      this[value ? "subscribe" : "unsubscribe"]();
    },
    disabled(value) {
      this[value ? "unsubscribe" : "subscribe"]();
    },
  },
  mounted() {
    if (this.url) {
      this.subscribe();
    }

    if (this.deleteOnUnload) {
      window.addEventListener("unload", this.delete);
    }
  },
  beforeUnmount() {
    this.unsubscribe();
  },
  methods: {
    subscribe() {
      this.storeUnsubscribe = this.editorStore.$onAction(({ name }) => {
        if (!this.timeoutId && name === "setDirty") {
          this.setTimeout();
        }
      });
    },
    unsubscribe() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      if (this.storeUnsubscribe) {
        this.storeUnsubscribe();
      }
    },
    setTimeout() {
      this.timeoutId = setTimeout(this.save, this.interval * 1000);
    },
    save() {
      this.saving = true;

      api
        .save(this.url, this.editorStore.getDirtyData(this.lastSave))
        .then(() => {
          this.lastSave = Date.now();
        })
        .catch(() => {
          this.setTimeout();
        })
        .finally(() => {
          this.saving = false;
          this.timeoutId = null;
        });
    },
    delete() {
      api.delete(this.url);
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
