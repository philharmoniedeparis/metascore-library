<template>
  <div class="history-controller">
    <styled-button type="button" :disabled="!canUndo" @click="onUndoClick">
      <template #icon><undo-icon /></template>
    </styled-button>

    <styled-button type="button" :disabled="!canRedo" @click="onRedoClick">
      <template #icon><redo-icon /></template>
    </styled-button>
  </div>
</template>

<script>
import * as manager from "../services/history-manager";
import UndoIcon from "../assets/icons/undo.svg?inline";
import RedoIcon from "../assets/icons/redo.svg?inline";

export default {
  components: {
    UndoIcon,
    RedoIcon,
  },
  computed: {
    canUndo() {
      return manager.canUndo();
    },
    canRedo() {
      return manager.canRedo();
    },
  },
  methods: {
    onUndoClick() {
      manager.undo();
    },
    onRedoClick() {
      manager.redo();
    },
  },
};
</script>

<style lang="scss" scoped>
.history-controller {
  display: flex;
  flex-direction: row;
  background-color: $darkgray;

  button {
    color: $white;
  }
}
</style>
