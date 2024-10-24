<i18n>
{
  "fr": {
    "label": {
      "enter": "Prévisualiser",
      "exit": "Quitter la prévisualisation",
      "exit-keeping-state": "Quitter la prévisualisation en conservant les changements d’état",
      "reset-state": "Rétablir les changements d’état effectués en mode prévisualisation",
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
      "enter": "Preview",
      "exit": "Quit preview",
      "exit-keeping-state": "Quit preview preserving state changes",
      "reset-state": "Reset state changes made in preview mode",
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
  <split-button class="app-preview-toggler">
    <base-button
      v-hotkey.prevent="hotkeys"
      v-tooltip
      :title="`${$t('title')} [${formatHotkey('mod+shift+e')}]`"
      type="button"
      :class="{ toggled: preview }"
      :disabled="disabled"
      @click="onTogglerClick"
    >
      <template #icon><toggle-icon /></template>
      {{ preview ? $t("label.exit") : $t("label.enter") }}
    </base-button>
    <template v-if="showPreserveOverrides" #secondary-actions>
      <base-button
        type="button"
        :disabled="disabled"
        @click="onExitKeepingStateClick"
      >
        {{ $t("label.exit-keeping-state") }}
      </base-button>
    </template>
    <template v-else-if="showClearOverrides" #secondary-actions>
      <base-button
        type="button"
        :disabled="disabled"
        @click="onClearStateClick"
      >
        {{ $t("label.reset-state") }}
      </base-button>
    </template>
  </split-button>
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
    const { hasOverrides: componentsHaveOverrides } =
      useModule("app_components");
    return { store, formatHotkey, componentsHaveOverrides };
  },
  computed: {
    preview() {
      return this.store.preview;
    },
    previewPersistant() {
      return this.store.previewPersistant;
    },
    preserveOverrides() {
      return this.store.preserveOverrides;
    },
    showPreserveOverrides() {
      return !this.disabled && this.preview && this.componentsHaveOverrides();
    },
    showClearOverrides() {
      return !this.disabled && !this.preview && this.componentsHaveOverrides();
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
    onExitKeepingStateClick() {
      this.store.setPreservedOverrides(true);
      this.store.togglePreview();
    },
    onClearStateClick() {
      this.store.setPreservedOverrides(false);
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
  :deep(.base-button) {
    color: var(--metascore-color-bg-tertiary);
    background: var(--metascore-color-white);
    border: 1px solid var(--metascore-color-white);
    border-radius: 1.5em;
  }

  &.has-secondary-actions {
    > :deep(.base-button):not(.split-button--toggle) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    :deep(.split-button--toggle) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    :deep(.split-button--secondary-actions) {
      border-radius: 1.5em;

      .base-button {
        color: var(--metascore-color-text-tertiary);
        background: var(--metascore-color-bg-tertiary);
        line-height: 2em;
        border: none;
      }
    }
  }
}
</style>
