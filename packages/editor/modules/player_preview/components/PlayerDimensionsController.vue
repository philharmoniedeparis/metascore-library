<template>
  <div class="player-dimensions-controller">
    <number-control
      v-model.number="width"
      :min="1"
      :spinners="false"
      @focus="onInputFocus"
      @blur="onInputBlur"
    />
    <span class="separator">x</span>
    <number-control
      v-model.number="height"
      :min="1"
      :spinners="false"
      @focus="onInputFocus"
      @blur="onInputBlur"
    />
  </div>
</template>

<script>
import useEditorStore from "@metascore-library/editor/store";
import { useModule } from "@metascore-library/core/services/module-manager";

export default {
  setup() {
    const editorStore = useEditorStore();
    const historyStore = useModule("history").useStore();
    return { editorStore, historyStore };
  },
  computed: {
    width: {
      get() {
        return this.editorStore.appWidth;
      },
      set(value) {
        this.editorStore.setAppWidth(value);
      },
    },
    height: {
      get() {
        return this.editorStore.appHeight;
      },
      set(value) {
        this.editorStore.setAppHeight(value);
      },
    },
  },
  methods: {
    onInputFocus() {
      this.historyStore.startGroup();
    },
    onInputBlur() {
      this.historyStore.endGroup();
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
