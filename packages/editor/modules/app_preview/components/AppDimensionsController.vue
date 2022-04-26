<template>
  <div class="app-dimensions-controller">
    <number-control
      v-model="width"
      class="width"
      :min="1"
      :spinners="false"
      @focus="onInputFocus"
      @blur="onInputBlur"
    />
    <span class="separator">x</span>
    <number-control
      v-model="height"
      class="height"
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
.app-dimensions-controller {
  display: flex;
  align-items: center;

  ::v-deep(.form-group) {
    input {
      width: 3em;
      text-align: center;
    }
  }
}
</style>
