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
    v-hotkey="hotkeys"
    v-hotkeyhelp="'mod+shift+e'"
    :title="$t('title')"
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
    return { store };
  },
  computed: {
    preview() {
      return this.store.preview;
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
    color: $darkgray;
    background: $white;
    border: 1px solid $white;
    border-radius: 1.5em;
  }
}
</style>
