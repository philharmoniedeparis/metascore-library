<i18n>
{
}
</i18n>

<template>
  <div class="component-form">
    <template v-for="(subSchema, key) in properties" :key="key">
      <control-dispatcher
        :property="key"
        :schema="subSchema"
        :value="model[key]"
        @change="onChange"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { omit } from "lodash";
import ControlDispatcher from "./controls/ControlDispatcher.vue";

export default {
  components: {
    ControlDispatcher,
  },
  provide() {
    return {
      getAjv: () => {
        return this.model?.$ajv;
      },
    };
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
      return this.model?.$schema || {};
    },
    properties() {
      return omit(this.schema?.properties, ["id", "type", "editor"]);
    },
  },
  methods: {
    onChange(evt) {
      this.model
        .$dispatch("update", {
          [evt.property]: evt.value,
        })
        .then(() => {
          console.log("updated");
          console.log(this.model.$data);
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
