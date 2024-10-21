<i18n>
{
  "fr": {
    "label": {
      "on": "Prévisualiser",
      "off": "Quitter la prévisualisation",
    },
    "title": "Basculer le mode de prévisualisation",
    "hotkey": {
      "group": "Général",
      "mod+e": "Basculer temporairement le mode de prévisualisation",
      "mod+shift+e": "Basculer le mode de prévisualisation",
    },
  },
  "en": {
    "label": {
      "on": "Preview",
      "off": "Quit preview",
    },
    "title": "Toggle preview mode",
    "hotkey": {
      "group": "General",
      "mod+e": "Toggle preview mode temporarily",
      "mod+shift+e": "Toggle preview mode",
    },
  }
}
</i18n>

<template>
  <base-button
    v-hotkey.prevent="hotkeys"
    v-tooltip
    :title="`${$t('title')} [${formatHotkey('mod+shift+e')}]`"
    type="button"
    :class="['app-preview-toggler', { toggled: preview }]"
    :disabled="disabled"
    @click="onTogglerClick"
  >
    <template #icon><toggle-icon /></template>
    {{ preview ? $t("label.off") : $t("label.on") }}
  </base-button>
</template>

<script>
import useStore from "../store";
import { useModule } from "@core/services/module-manager";
import ToggleIcon from "../assets/icons/preview-toggle.svg?inline";

export default {
  components: {
    ToggleIcon,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore();

    const { format: formatHotkey } = useModule("hotkey");

    return { store, formatHotkey };
  },
  computed: {
    preview() {
      return this.store.preview;
    },
    previewPersistant() {
      return this.store.previewPersistant;
    },
    hotkeys() {
      return {
        group: this.$t("hotkey.group"),
        keys: {
          "mod+e": {
            handler: {
              keydown: this.onTemporaryHotkeyDown,
              keyup: this.onTemporaryHotkeyUp,
            },
            description: this.$t("hotkey.mod+e"),
          },
          cmd: {
            // Workaround a macOS specific handling of ⌘ combinations,
            // where the keyup event is never triggered.
            handler: {
              keyup: this.onTemporaryHotkeyUp,
            },
          },
          "mod+shift+e": {
            handler: this.onPersistentHotkey,
            description: this.$t("hotkey.mod+shift+e"),
          },
        },
      };
    },
  },
  methods: {
    onTogglerClick() {
      this.store.togglePreview();
    },
    onTemporaryHotkeyDown(evt) {
      if (evt.repeat) return;
      this.store.togglePreview(true, false);
    },
    onTemporaryHotkeyUp(evt) {
      if (evt.repeat) return;

      // This check is for the macOS workaround (see hotkeys computed propoerty).
      if (!this.preview || this.previewPersistant) return;

      this.store.togglePreview(false, false);
    },
    onPersistentHotkey(evt) {
      if (evt.repeat) return;
      this.store.togglePreview();
    },
  },
};
</script>

<style lang="scss" scoped>
.app-preview-toggler {
  &.base-button {
    padding: 0 1em;
    color: var(--metascore-color-bg-tertiary);
    background: var(--metascore-color-white);
    border: 1px solid var(--metascore-color-white);
    border-radius: 1.5em;
  }
}
</style>
