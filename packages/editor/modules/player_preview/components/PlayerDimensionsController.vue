<template>
  <div class="player-dimensions-controller">
    <number-control
      v-model="width"
      :options="options"
      :min="1"
      :spinners="false"
    />
    <span class="separator">x</span>
    <number-control
      v-model="height"
      :options="options"
      :min="1"
      :spinners="false"
    />
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/services/module-manager";

export default {
  setup() {
    const appRendererStore = useStore("app-renderer");
    const editorStore = useStore("editor");
    return { appRendererStore, editorStore };
  },
  computed: {
    width: {
      get() {
        return this.appRendererStore.width;
      },
      set(width) {
        this.editorStore.setPlayerDimensions({ width });
      },
    },
    height: {
      get() {
        return this.appRendererStore.height;
      },
      set(height) {
        this.editorStore.setPlayerDimensions({ height });
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.player-dimensions-controller {
  display: flex;
  gap: 0.5em;
  align-items: center;

  ::v-deep(.form-group) {
    margin: 0;

    input {
      width: 4em;
    }
  }
}
</style>
