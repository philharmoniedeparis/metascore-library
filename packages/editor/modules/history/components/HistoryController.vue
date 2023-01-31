<i18n>
  {
    "fr": {
      "undo": "Annuler",
      "redo": "Rétablir",
      "hotkey": {
        "group": "Général",
        "mod+z": "Annuler",
        "mod+y": "Rétablir",
      },
    },
    "en": {
      "undo": "Undo",
      "redo": "Redo",
      "hotkey": {
        "group": "General",
        "mod+z": "Undo",
        "mod+y": "Redo",
      },
    },
  }
</i18n>

<template>
  <div v-hotkey="hotkeys" class="history-controller">
    <base-button
      v-hotkeyhelp="'mod+z'"
      type="button"
      :disabled="!canUndo || disabled"
      :title="$t('undo')"
      @click="onUndoClick"
    >
      <template #icon><undo-icon /></template>
    </base-button>

    <base-button
      v-hotkeyhelp="'mod+y'"
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
          "mod+z": {
            handler: this.store.undo,
            description: this.$t("hotkey.mod+z"),
          },
          "mod+y": {
            handler: this.store.redo,
            description: this.$t("hotkey.mod+y"),
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
  background-color: var(--metascore-color-bg-primary);
}
</style>
