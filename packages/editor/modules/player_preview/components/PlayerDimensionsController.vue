<template>
  <div class="player-dimensions-controller">
    <number-control v-model="width" :min="1" :spinners="false" />
    <span class="separator">x</span>
    <number-control v-model="height" :min="1" :spinners="false" />
  </div>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";
import useEditorStore from "@metascore-library/editor/store";

export default {
  setup() {
    const editorStore = useEditorStore();
    const appRendererStore = useModule("app_renderer").useStore();
    return { editorStore, appRendererStore };
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
    input {
      width: 4em;
    }
  }
}
</style>
