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
        :flatten-schema="false"
        :schema="flattenSchema ? flattenedSchema : schema"
        :layout="subLayout"
        :values="values"
        :errors="errors"
        :path="subLayout.property ? `${path}/${subLayout.property}` : path"
        @update:model-value="onSubFormUpdate"
      />
    </template>
    <template v-else-if="layout.content">{{ layout.content }}</template>
  </component>
  <control-dispatcher
    v-else-if="layout.property in flattenedSchema.properties"
    v-bind="props"
    @update:model-value="onControlUpdate(layout.property, $event)"
  />
</template>

<script>
import { omit } from "lodash";
import { markRaw } from "vue";
import Ajv from "ajv";
import localize_fr from "ajv-i18n/localize/fr";
import localize_en from "ajv-i18n/localize/en";
import { flatten } from "../utils/schema";

const localize = {
  fr: localize_fr,
  en: localize_en,
};

export default {
  provide() {
    return {
      validator: this.validator,
    };
  },
  props: {
    schema: {
      type: Object,
      required: true,
    },
    flattenSchema: {
      type: Boolean,
      default: true,
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
    values: {
      type: Object,
      default() {
        return {};
      },
    },
    errors: {
      type: Array,
      default() {
        return null;
      },
    },
    path: {
      type: String,
      default: "",
    },
    validator: {
      type: Object,
      default() {
        const ajv = new Ajv({
          allErrors: true,
          verbose: true,
          strict: false,
          multipleOfPrecision: 2,
        });
        return markRaw(ajv);
      },
    },
  },
  emits: ["update:modelValue"],
  computed: {
    flattenedSchema() {
      return flatten(this.schema, this.validator, this.values, true);
    },
    controlErrors() {
      if (this.errors) {
        const locale = this.$i18n.locale;
        const errors = this.errors.filter((e) => e.instancePath === this.path);
        localize[locale](errors);
        return errors.map((e) => e.message);
      }

      return null;
    },
    props() {
      switch (this.layout.type) {
        case "markup":
          return omit(this.layout, ["type", "tag", "items", "content"]);

        default:
          return {
            type: this.layout.type || null,
            property: this.layout.property,
            modelValue: this.values[this.layout.property],
            schema: this.schema.properties[this.layout.property],
            required: this.schema.required?.includes(this.layout.property),
            errors: this.controlErrors,
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
