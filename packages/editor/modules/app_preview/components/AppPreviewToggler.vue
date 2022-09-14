<i18n>
{
  "fr": {
    "hotkey": {
      "group": "Général",
      "ctrl+e": "Basculer temporairement le mode de prévisualisation",
      "ctrl+shift+e": "Basculer le mode de prévisualisation",
    },
  },
  "en": {
    "hotkey": {
      "group": "General",
      "ctrl+e": "Toggle preview mode temporarily",
      "ctrl+shift+e": "Toggle preview mode",
    },
  }
}
</i18n>

<template>
  <checkbox-control
    v-model="preview"
    v-hotkey="hotkeys"
    class="app-preview-toggler"
    :disabled="disabled"
  >
    <toggle-icon class="icon" />
  </checkbox-control>
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
    preview: {
      get() {
        return this.store.preview;
      },
      set(value) {
        this.store.preview = value;
      },
    },
    hotkeys() {
      return {
        group: this.$t("hotkey.group"),
        keys: {
          "ctrl+e": {
            handler: {
              keydown: this.onHotkey,
              keyup: this.onHotkey,
            },
            description: this.$t("hotkey.ctrl+e"),
          },
          "ctrl+shift+e": {
            handler: this.onHotkey,
            description: this.$t("hotkey.ctrl+shift+e"),
          },
        },
      };
    },
  },
  methods: {
    onHotkey(evt) {
      if (evt.repeat) {
        return;
      }

      this.preview = !this.preview;
    },
  },
};
</script>

<style lang="scss" scoped>
.app-preview-toggler {
  margin: 0;

  :deep(input) {
    & + label {
      color: $white;
      background: none;
    }

    &:not(:checked) + label {
      opacity: 0.25;
    }
  }
}
</style>
