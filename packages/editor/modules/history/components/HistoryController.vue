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
import useStore from "../store";
import UndoIcon from "../assets/icons/undo.svg?inline";
import RedoIcon from "../assets/icons/redo.svg?inline";

export default {
  components: {
    UndoIcon,
    RedoIcon,
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
  background-color: $darkgray;
}
</style>
