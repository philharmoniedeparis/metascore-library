<i18n>
{
  "fr": {
    "title": "Ajouter un scénario",
    "name_label": "Nom du nouvea scénario",
    "apply_button": "Ajouter",
    "cancel_button": "Annuler",
  },
  "en": {
    "title": "Add a scenario",
    "name_label": "Name of new scenario",
    "apply_button": "Add",
    "cancel_button": "Cancel",
  },
}
</i18n>

<template>
  <modal-form :title="$t('title')" @submit="onSubmit" @close="onCancel">
    <schema-form
      class="scenario-manager--add-form"
      :schema="schema"
      :layout="layout"
      :values="model"
      :validator="validator"
      @update:model-value="onUpdate($event)"
    />

    <template #actions="props">
      <styled-button :form="props.form" role="primary">
        {{ $t("apply_button") }}
      </styled-button>

      <styled-button
        type="button"
        :form="props.form"
        role="secondary"
        @click="onCancel"
      >
        {{ $t("cancel_button") }}
      </styled-button>
    </template>
  </modal-form>
</template>

<script>
import Model from "../models/ScenarioName";

export default {
  emits: ["submit", "close"],
  data() {
    return {
      model: new Model(),
    };
  },
  computed: {
    schema() {
      return this.model.$schema;
    },
    validator() {
      return this.model.$ajv;
    },
    layout() {
      return {
        type: "markup",
        items: [
          { property: "name", label: this.$t("name_label"), autofocus: true },
        ],
      };
    },
  },
  methods: {
    onUpdate({ property, value }) {
      this.model.update({
        [property]: value,
      });
    },
    onSubmit() {
      this.$emit("submit", this.model.$data);
    },
    onCancel() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.scenario-manager--add-form {
  ::v-deep(.input-wrapper) {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
