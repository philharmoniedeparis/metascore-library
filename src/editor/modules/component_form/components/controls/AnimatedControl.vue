<template>
  <form-group
    :class="['control', 'animated', { readonly, disabled }]"
    :data-property="property"
    :label="label"
    :description="description"
    :required="required"
  >
    <checkbox-control
      :model-value="value.animated"
      :readonly="readonly"
      :disabled="disabled"
      data-property="animated"
      v-bind="itemProps.animated || {}"
      @update:model-value="updateAnimated($event)"
    >
      <check-icon class="icon" />
    </checkbox-control>
    <control-dispatcher
      :model-value="valueAtTime"
      :schema="valueSchema"
      :readonly="readonly"
      :disabled="disabled"
      property="value"
      v-bind="itemProps.value || {}"
      @update:model-value="updateValue($event)"
    />
  </form-group>
</template>

<script>
import { useModule } from "@core/services/module-manager";
import { round } from "lodash";
import CheckIcon from "../../assets/icons/animated-check.svg?component";

export default {
  components: {
    CheckIcon,
  },
  props: {
    label: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    property: {
      type: String,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
    },
    itemProps: {
      type: Object,
      default() {
        return {
          animated: {},
          value: {},
        };
      },
    },
    modelValue: {
      type: Object,
      default() {
        return { animated: false, value: null };
      },
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const { time: mediaTime } = useModule("media_player");
    const { getAnimatedValueAtTime } = useModule("app_components");
    return { mediaTime, getAnimatedValueAtTime };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    roundedMediaTime() {
      return round(this.mediaTime, 2);
    },
    animatedSchema() {
      return this.schema.properties.animated;
    },
    valueSchema() {
      return !this.value.animated
        ? this.schema.properties.value
        : this.schema.properties.value.items.items[1];
    },
    valueAtTime() {
      return !this.value.animated
        ? this.value.value
        : this.getAnimatedValueAtTime(this.value.value, this.mediaTime);
    },
  },
  methods: {
    updateAnimated(animated) {
      let value = this.value.value;
      if (animated) {
        value = [[this.roundedMediaTime, value]];
      } else {
        value = value[0][1];
      }

      this.value = { animated, value };
    },
    updateValue(input) {
      const animated = this.value.animated;
      let value = this.value.value;

      if (animated) {
        const time = this.roundedMediaTime;
        const index = this.value.value.findIndex((v) => v[0] === time);
        if (index >= 0) {
          value = [
            ...value.slice(0, index),
            [time, input],
            ...value.slice(index + 1),
          ];
        } else {
          value = value.concat([[time, input]]).sort((a, b) => a[0] - b[0]);
        }
      } else {
        value = input;
      }

      this.value = { animated, value };
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-content: flex-start;

  :deep(.control[data-property="animated"]) {
    input + label {
      background: none;
    }

    input:not(:checked) + label {
      opacity: 0.25;
    }

    svg {
      display: block;
    }
  }
}
</style>
