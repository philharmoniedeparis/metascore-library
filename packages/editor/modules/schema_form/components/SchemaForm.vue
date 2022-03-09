<template>
  <div class="schema-form">
    <control-dispatcher
      v-for="(subSchema, property) in schema.properties"
      :key="property"
      :property="property"
      :model-value="values[property]"
      :schema="subSchema"
      @update:model-value="onUpdate(property, $event)"
    />
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  provide() {
    return {
      validator: computed(() => this.validator),
    };
  },
  props: {
    schema: {
      type: Object,
      required: true,
    },
    values: {
      type: Object,
      default() {
        return {};
      },
    },
    validator: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  methods: {
    onUpdate(property, value) {
      this.$emit("update:modelValue", { property, value });
    },
  },
};
</script>
