<template>
  <div class="control-wrapper">
    <control-dispatcher
      property="animated"
      :schema="animatedSchema"
      :value="value.animated"
      :display-label="false"
      @change="onAnimatedChange"
    />
    <control-dispatcher
      property="value"
      :schema="valueSchema"
      :value="valueAtTime"
      :display-label="false"
      @change="onValueChange"
    />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { round } from "lodash";
import { getAnimatedValueAtTime } from "../../../../../utils/animation";
import ControlDispatcher from "./ControlDispatcher.vue";

export default {
  components: {
    ControlDispatcher,
  },
  props: {
    property: {
      type: String,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
    },
    flattenedSchema: {
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
      return this.flattenedSchema.properties.animated;
    },
    valueSchema() {
      return !this.value.animated
        ? this.flattenedSchema.properties.value
        : this.flattenedSchema.properties.value.items.items[1];
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

<style lang="scss" scoped></style>
