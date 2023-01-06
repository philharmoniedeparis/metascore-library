<i18n>
  {
    "fr": {
      "undo": "Annuler [Ctrl+Z]",
      "redo": "Rétablir [Ctrl+Y]",
      "hotkey": {
        "group": "Général",
        "ctrl+z": "Annuler",
        "ctrl+y": "Rétablir",
      },
    },
    "en": {
      "undo": "Undo [Ctrl+Z]",
      "redo": "Redo [Ctrl+Y]",
      "hotkey": {
        "group": "General",
        "ctrl+z": "Undo",
        "ctrl+y": "Redo",
      },
    },
  }
</i18n>

<template>
  <div v-hotkey="hotkeys" class="history-controller">
    <base-button
      type="button"
      :disabled="!canUndo || disabled"
      :title="$t('undo')"
      @click="onUndoClick"
    >
      <template #icon><undo-icon /></template>
    </base-button>

    <base-button
      type="button"
      :disabled="!canRedo || disabled"
      :title="$t('redo')"
      @click="onRedoClick"
    >
      <template #icon><redo-icon /></template>
    </base-button>
  </div>
</template>

<script>
import useStore from "../store";
import UndoIcon from "../assets/icons/undo.svg?inline";
import RedoIcon from "../assets/icons/redo.svg?inline";

export default {
  components: {
    UndoIcon,
    RedoIcon,
  },
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
  computed: {
    canUndo() {
      return this.store.canUndo;
    },
    canRedo() {
      return this.store.canRedo;
    },
    hotkeys() {
      return {
        group: this.$t("hotkey.group"),
        keys: {
          "ctrl+z": {
            handler: this.store.undo,
            description: this.$t("hotkey.ctrl+z"),
          },
          "ctrl+y": {
            handler: this.store.redo,
            description: this.$t("hotkey.ctrl+y"),
          },
        },
      };
    },
  },
  methods: {
    onUndoClick() {
      this.store.undo();
    },
    onRedoClick() {
      this.store.redo();
    },
  },
};
</script>

<style lang="scss" scoped>
.history-controller {
  display: flex;
  flex-direction: row;
  background-color: $darkgray;
}
</style>
