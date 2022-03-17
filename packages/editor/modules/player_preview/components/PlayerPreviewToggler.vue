<template>
  <checkbox-control
    v-model="preview"
    v-hotkey="hotkeys"
    class="player-preview-toggler"
  >
    <toggle-icon class="icon" />
  </checkbox-control>
</template>

<script>
import { useStore } from "@metascore-library/core/services/module-manager";
import ToggleIcon from "../assets/icons/preview-toggle.svg?inline";

export default {
  components: {
    ToggleIcon,
  },
  setup() {
    const editorStore = useStore("editor");
    return { editorStore };
  },
  computed: {
    preview: {
      get() {
        return this.editorStore.preview;
      },
      set(value) {
        this.editorStore.preview = value;
      },
    },
    hotkeys() {
      return {
        "ctrl+e": {
          keydown: this.onHotkey,
          keyup: this.onHotkey,
        },
        "ctrl+shift+e": this.onHotkey,
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
.player-preview-toggler {
  margin: 0;

  ::v-deep(input) {
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
