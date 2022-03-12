<template>
  <control-dispatcher
    v-if="!layout.type || layout.type === 'control'"
    v-bind="controlProps"
    @update:model-value="onControlUpdate(layout.property, $event)"
  />
  <component :is="`${layoutType}-layout`" v-else v-bind="layoutProps">
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
    controlProps() {
      return {
        property: this.layout.property,
        modelValue: this.values[this.layout.property],
        schema: this.schema.properties[this.layout.property],
        "data-property": this.layout.property,
        ...omit(this.layout, ["property"]),
      };
    },
    layoutType() {
      return this.layout.type ?? "vertical";
    },
    layoutProps() {
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
