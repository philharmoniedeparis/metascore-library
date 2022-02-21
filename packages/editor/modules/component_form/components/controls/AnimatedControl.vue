<template>
  <form-group
    class="control animated"
    :data-property="property"
    :label="label"
    :label-for="inputId"
  >
    <boolean-control
      :model-value="value.animated"
      property="animated"
      :schema="animatedSchema"
      @update:model-value="updateAnimated($event)"
    >
      <check-icon class="icon" />
    </boolean-control>
    <control-dispatcher
      :model-value="valueAtTime"
      property="value"
      :schema="valueSchema"
      :validator="validator"
      @update:model-value="updateValue($event)"
    />
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import { mapState } from "vuex";
import { round } from "lodash";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";
import BooleanControl from "./BooleanControl.vue";
import ControlDispatcher from "./ControlDispatcher.vue";
import CheckIcon from "../../assets/icons/animated-check.svg?inline";

export default {
  components: {
    BooleanControl,
    ControlDispatcher,
    CheckIcon,
  },
  props: {
    label: {
      type: String,
      default: null,
    },
    property: {
      type: String,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
    },
    validator: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: Object,
      default() {
        return { animated: false, value: null };
      },
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      inputId: uuid(),
    };
  },
  computed: {
    ...mapState("media", {
      mediaTime: "time",
    }),
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
        : getAnimatedValueAtTime(this.value.value, this.mediaTime);
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
          value[index][1] = input;
        } else {
          value.push([time, input]);
          value.sort((a, b) => a[0] - b[0]);
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

  ::v-deep(.control[data-property="animated"]) {
    flex: 0;
    order: -1;

    input + label {
      color: $white;
      background: none;
    }

    input:not(:checked) + label {
      opacity: 0.25;
    }
  }
}
</style>
