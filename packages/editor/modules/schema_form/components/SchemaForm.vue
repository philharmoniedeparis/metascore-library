<template>
  <component :is="tag" v-if="type === 'markup'" v-bind="props">
    <template v-if="prefix">{{ prefix }}</template>
    <schema-form
      v-for="(subLayout, index) in items"
      :key="index"
      :layout="subLayout"
      :schema="schema"
      :values="values"
      @update:model-value="onSubFormUpdate"
    />
    <template v-if="suffix">{{ suffix }}</template>
  </component>
  <control-dispatcher
    v-else
    v-bind="props"
    @update:model-value="onControlUpdate(property, $event)"
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
    computedLayout() {
      return (
        this.layout ?? {
          type: "markup",
          items: Object.keys(this.schema.properties).map((property) => {
            return {
              type: "control",
              property,
            };
          }),
        }
      );
    },
    type() {
      const layout = this.computedLayout;
      return layout.type ?? "control";
    },
    tag() {
      const layout = this.computedLayout;
      return layout.tag ?? "div";
    },
    items() {
      const layout = this.computedLayout;
      return layout.items ?? [];
    },
    property() {
      const layout = this.computedLayout;
      return layout.property ?? null;
    },
    prefix() {
      const layout = this.computedLayout;
      return layout.prefix ?? null;
    },
    suffix() {
      const layout = this.computedLayout;
      return layout.suffix ?? null;
    },
    props() {
      const layout = this.computedLayout;

      switch (this.type) {
        case "markup":
          return omit(layout, ["type", "tag", "prefix", "items", "suffix"]);

        default:
          return {
            property: layout.property,
            modelValue: this.values[layout.property],
            schema: this.schema.properties[layout.property],
            "data-property": layout.property,
            ...omit(layout, ["property"]),
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
