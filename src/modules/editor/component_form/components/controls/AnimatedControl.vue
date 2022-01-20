<template>
  <div class="control animated" :data-property="property">
    <label v-if="label">{{ label }}</label>
    <boolean-control
      property="animated"
      :schema="animatedSchema"
      :value="value.animated"
      @change="onAnimatedChange"
    >
      <check-icon class="icon" />
    </boolean-control>
    <control-dispatcher
      property="value"
      :schema="valueSchema"
      :value="valueAtTime"
      @change="onValueChange"
    />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { round } from "lodash";
import { getAnimatedValueAtTime } from "../../../../../utils/animation";
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
    value: {
      type: Object,
      default() {
        return { animated: false, value: null };
      },
    },
  },
  emits: ["change"],
  computed: {
    ...mapState("media", {
      mediaTime: "time",
    }),
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
    onAnimatedChange({ value: animated }) {
      let value = this.value.value;
      if (animated) {
        value = [[this.roundedMediaTime, value]];
      } else {
        value = value[0][1];
      }

      this.$emit("change", {
        property: this.property,
        value: {
          animated,
          value,
        },
      });
    },
    onValueChange({ value: input }) {
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

      this.$emit("change", {
        property: this.property,
        value: {
          animated,
          value,
        },
      });
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
