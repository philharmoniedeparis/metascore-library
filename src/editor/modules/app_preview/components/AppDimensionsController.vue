<i18n>
  {
    "fr": {
      "width": "Largeur",
      "height": "Hauteur"
    },
    "en": {
      "width": "Width",
      "height": "Height"
    }
  }
</i18n>

<template>
  <div :class="['app-dimensions-controller', { disabled }]">
    <number-control
      v-model="width"
      v-tooltip
      :title="$t('width')"
      class="width"
      :disabled="disabled"
      :min="1"
      :spinners="false"
      @focus="onInputFocus"
      @blur="onInputBlur"
    />
    <span class="separator">x</span>
    <number-control
      v-model="height"
      v-tooltip
      :title="$t('height')"
      class="height"
      :disabled="disabled"
      :min="1"
      :spinners="false"
      @focus="onInputFocus"
      @blur="onInputBlur"
    />
  </div>
</template>

<script>
import { useModule } from "@core/services/module-manager";

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const {
      width: appWidth,
      setWidth: setAppWidth,
      height: appHeight,
      setHeight: setAppHeight,
    } = useModule("core:app_renderer");
    const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
      useModule("editor:history");
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
      this.startHistoryGroup({ coalesce: true });
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

  &.disabled {
    .separator {
      opacity: 0.25;
    }
  }
}
</style>
