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
import { generateDefaultUISchema } from "@jsonforms/core";
import { JsonForms } from "@jsonforms/vue";
import { vanillaRenderers } from "@jsonforms/vue-vanilla";
import { customRenderers } from "./renderers";

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
      const uischema = generateDefaultUISchema(this.schema);

      console.log("schema", this.schema);

      uischema.elements = uischema.elements
        .filter((control) => {
          return ![
            "#/properties/type",
            "#/properties/id",
            "#/properties/editor",
            "#/properties/dimension",
            //"#/properties/translate",
            //"#/properties/scale",
            //"#/properties/position",
          ].includes(control.scope);
        })
        .map((control) => {
          switch (control.scope) {
            /*case "#/properties/position":
              return {
                type: "Group",
                label: "Position",
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/position/items",
                  },
                  {
                    type: "Control",
                    scope: "#/properties/position/items",
                  },
                ],
              };*/
            default:
              return control;
          }
        });

      console.log("uischema", uischema);

      return uischema;
    },
    ajv() {
      return this.model?.$ajv;
    },
  },
  data() {
    return {
      // freeze renderers for performance gains
      renderers: Object.freeze([...vanillaRenderers, ...customRenderers]),
    };
  },
  methods: {
    onChange(evt) {
      this.data = evt.data;
    },
  },
};
</script>

<style lang="scss" scoped></style>
