<i18n>
{
}
</i18n>

<template>
  <div v-if="masterModel" class="component-form">
    <template v-for="(subSchema, key) in properties" :key="key">
      <control-dispatcher
        :property="key"
        :schema="subSchema"
        :value="masterModel[key]"
        @change="onChange"
      />
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { omit, intersection } from "lodash";
import ControlDispatcher from "./controls/ControlDispatcher.vue";

export default {
  components: {
    ControlDispatcher,
  },
  provide() {
    return {
      getAjv: () => {
        return this.masterModel?.$ajv;
      },
    };
  },
  computed: {
    ...mapGetters({ selectedComponents: "getSelectedComponents" }),
    masterModel() {
      return this.selectedComponents[0];
    },
    commonClass() {
      let commonClasses = [];
      this.selectedComponents.forEach((model, index) => {
        const modelChain = model.$modelChain;
        commonClasses =
          index > 0 ? intersection(commonClasses, modelChain) : modelChain;
      });
      return commonClasses[0];
    },
    schema() {
      return this.commonClass?.schema;
    },
    properties() {
      return omit(this.schema.properties, ["id", "type", "editor"]);
    },
  },
  methods: {
    ...mapActions(["updateComponents"]),
    onChange(evt) {
      console.log(evt);
      const data = {
        [evt.property]: evt.value,
      };

      this.updateComponents({
        models: this.selectedComponents,
        data,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
