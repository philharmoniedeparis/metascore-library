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
.app-preview-toggler {
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