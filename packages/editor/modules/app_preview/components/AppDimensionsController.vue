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
import { useModule } from "@metascore-library/core/services/module-manager";

export default {
  setup() {
    const {
      width: appWidth,
      setWidth: setAppWidth,
      height: appHeight,
      setHeight: setAppHeight,
    } = useModule("app_renderer");
    const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
      useModule("history");
    return {
      appWidth,
      setAppWidth,
      appHeight,
      setAppHeight,
      startHistoryGroup,
      endHistoryGroup,
    };
  },
  computed: {
    width: {
      get() {
        return this.appWidth;
      },
      set(value) {
        this.setAppWidth(value);
      },
    },
    height: {
      get() {
        return this.appHeight;
      },
      set(value) {
        this.setAppHeight(value);
      },
    },
  },
  methods: {
    onInputFocus() {
      this.startHistoryGroup();
    },
    onInputBlur() {
      this.endHistoryGroup();
    },
  },
};
</script>

<style lang="scss" scoped>
.app-dimensions-controller {
  display: flex;
  align-items: center;

  :deep(.form-group) {
    input {
      width: 3em;
      text-align: center;
    }
  }
}
</style>
