<template>
  <layout-dispatcher
    :layout="generatedLayout"
    :schema="schema"
    :values="values"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script>
import { computed } from "vue";
import Ajv from "ajv";
import LayoutDispatcher from "./LayoutDispatcher.vue";

export default {
  components: {
    LayoutDispatcher,
  },
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
    layout: {
      type: Object,
      default() {
        return null;
      },
    },
    validator: {
      type: Object,
      default() {
        return new Ajv({
          allErrors: true,
          verbose: true,
          strict: false,
          multipleOfPrecision: 2,
        });
      },
    },
  },
  emits: ["update:modelValue"],
  computed: {
    generatedLayout() {
      return (
        this.layout ?? {
          type: "vertical",
          items: Object.keys(this.schema.properties).map((property) => {
            return {
              type: "control",
              property,
            };
          }),
        }
      );
    },
  },
};
</script>
