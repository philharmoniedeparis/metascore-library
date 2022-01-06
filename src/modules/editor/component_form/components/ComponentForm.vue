<i18n>
{
}
</i18n>

<template>
  <div class="component-form">
    <json-forms
      v-if="model"
      :data="data"
      :schema="schema"
      :uischema="uischema"
      :ajv="ajv"
      :renderers="renderers"
      @change="onChange"
    />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { JsonForms } from "@jsonforms/vue";
import { defaultStyles, vanillaRenderers } from "@jsonforms/vue-vanilla";
import "@jsonforms/vue-vanilla/vanilla.css";

export default {
  components: {
    JsonForms,
  },
  computed: {
    ...mapState(["selectedComponents"]),
    model() {
      return Object.values(this.selectedComponents)[0];
    },
    data: {
      get() {
        return this.model?.$data;
      },
      set(data) {
        this.model.$dispatch("update", data);
      },
    },
    schema() {
      return this.model?.$schema;
    },
    uischema() {
      const schema = {
        type: "VerticalLayout",
        elements: [],
      };

      const properties = this.model?.$properties;
      if (properties) {
        Object.entries(properties)
          .filter(([key]) => {
            return !["type", "id", "editor"].includes(key);
          })
          .forEach(([key, value]) => {
            if (value.type === "array") {
              // TODO
            } else {
              schema.elements.push({
                type: "Control",
                scope: `#/properties/${key}`,
              });
            }
          });
      }

      return schema;
    },
    ajv() {
      return this.model?.$ajv;
    },
  },
  data() {
    return {
      // freeze renderers for performance gains
      renderers: Object.freeze(vanillaRenderers),
    };
  },
  methods: {
    onChange(evt) {
      this.data = evt.data;
    },
  },
  provide() {
    return {
      styles: defaultStyles,
    };
  },
};
</script>

<style lang="scss" scoped></style>
