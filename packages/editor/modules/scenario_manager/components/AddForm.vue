<i18n>
{
  "fr": {
    "title": "Ajouter un scénario",
    "name_label": "Nom du nouveau scénario",
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
  <modal-form
    :title="$t('title')"
    :validate="false"
    @submit="onSubmit"
    @close="onCancel"
  >
    <schema-form
      v-if="model"
      class="scenario-manager--add-form"
      :schema="schema"
      :layout="layout"
      :values="model.data"
      :validator="validator"
      :errors="errors"
      @update:model-value="onUpdate($event)"
    />

    <template #actions="props">
      <base-button :form="props.form" role="primary">
        {{ $t("apply_button") }}
      </base-button>

      <base-button
        type="button"
        :form="props.form"
        role="secondary"
        @click="onCancel"
      >
        {{ $t("cancel_button") }}
      </base-button>
    </template>
  </modal-form>
</template>

<script>
import Model from "../models/ScenarioName";

export default {
  emits: ["submit", "close"],
  data() {
    return {
      model: null,
      errors: null,
    };
  },
  computed: {
    schema() {
      return this.model.schema;
    },
    validator() {
      return this.model.ajv;
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
  async mounted() {
    this.model = await Model.create({}, false);
  },
  methods: {
    onUpdate({ property, value }) {
      this.model.update({ [property]: value }, false);
    },
    async onSubmit() {
      this.errors = null;

      try {
        const data = await this.model.validate(this.model.data);
        this.$emit("submit", data);
      } catch (errors) {
        this.errors = errors;
      }
    },
    onCancel() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.scenario-manager--add-form {
  :deep(.input-wrapper) {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
