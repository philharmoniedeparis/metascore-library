<template>
  <control-dispatcher
    property="animated"
    :schema="flattened.properties.animated"
    :value="value.animated"
    :display-label="false"
  />
  <control-dispatcher
    property="value"
    :schema="flattened.properties.value"
    :value="value.value"
    :display-label="false"
  />
</template>

<script>
import { flatten } from "../../utils/schema";
import ControlDispatcher from "./ControlDispatcher.vue";

export default {
  components: {
    ControlDispatcher,
  },
  inject: ["getAjv"],
  props: {
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
    flattened() {
      return flatten(this.schema, this.getAjv(), this.value);
    },
  },
  methods: {
    onChange(evt) {
      this.$emit("change", {
        property: this.property,
        value: evt.target.value,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
