<template>
  <component
    :is="layout.tag || 'div'"
    v-if="layout.type === 'markup'"
    v-bind="props"
  >
    <template v-if="layout.items">
      <schema-form
        v-for="(subLayout, index) in layout.items"
        :key="index"
        :layout="subLayout"
        :schema="schema"
        :values="values"
        @update:model-value="onSubFormUpdate"
      />
    </template>
    <template v-else-if="layout.content">{{ layout.content }}</template>
  </component>
  <control-dispatcher
    v-else-if="layout.property in schema.properties"
    v-bind="props"
    @update:model-value="onControlUpdate(layout.property, $event)"
  />
</template>

<script>
import { omit } from "lodash";
import { computed } from "vue";
import Ajv from "ajv";

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
    layout: {
      type: Object,
      default(props) {
        return {
          type: "markup",
          items: Object.entries(props.schema.properties).map(([key, value]) => {
            return {
              type: "control",
              property: key,
              label: value.title,
              description: value.description,
            };
          }),
        };
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
    props() {
      switch (this.layout.type) {
        case "markup":
          return omit(this.layout, ["type", "tag", "items", "content"]);

        default:
          return {
            property: this.layout.property,
            modelValue: this.values[this.layout.property],
            schema: this.schema.properties[this.layout.property],
            "data-property": this.layout.property,
            ...omit(this.layout, ["property"]),
          };
      }
    },
  },
  methods: {
    onControlUpdate(property, value) {
      this.$emit("update:modelValue", { property, value });
    },
    onSubFormUpdate(event) {
      this.$emit("update:modelValue", event);
    },
  },
};
</script>
