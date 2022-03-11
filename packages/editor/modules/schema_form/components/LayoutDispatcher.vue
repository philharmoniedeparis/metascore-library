<template>
  <control-dispatcher
    v-if="!layout.type || layout.type === 'control'"
    :property="layout.property"
    :model-value="values[layout.property]"
    :schema="schema.properties[layout.property]"
    @update:model-value="onControlUpdate(layout.property, $event)"
  />
  <component :is="`${type}-layout`" v-else v-bind="props">
    <layout-dispatcher
      v-for="(subLayout, index) in layout.items"
      :key="index"
      :layout="subLayout"
      :schema="schema"
      :values="values"
      @update:model-value="onSubLayoutUpdate"
    />
  </component>
</template>

<script>
import { omit } from "lodash";
import GroupLayout from "./GroupLayout.vue";
import HorizontalLayout from "./HorizontalLayout.vue";
import VerticalLayout from "./VerticalLayout.vue";

export default {
  components: {
    GroupLayout,
    HorizontalLayout,
    VerticalLayout,
  },
  props: {
    layout: {
      type: Object,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
    },
    values: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  computed: {
    type() {
      return this.layout.type ?? "vertical";
    },
    props() {
      return omit(this.layout, ["type", "items"]);
    },
  },
  methods: {
    onControlUpdate(property, value) {
      this.$emit("update:modelValue", { property, value });
    },
    onSubLayoutUpdate(event) {
      this.$emit("update:modelValue", event);
    },
  },
};
</script>
