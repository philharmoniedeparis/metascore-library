<i18n>
{
  "fr": {
    "title": "Dupliquer le scénario <em>{name}</em>",
    "name_label": "Nom du nouvea scénario",
    "apply_button": "Dupliquer",
    "cancel_button": "Annuler",
  },
  "en": {
    "title": "Clone the scenario <em>{name}</em>",
    "name_label": "Name of new scenario",
    "apply_button": "Clone",
    "cancel_button": "Cancel",
  },
}
</i18n>

<template>
  <modal-form :validate="false" @submit="onSubmit" @close="onCancel">
    <template #title>
      <span v-dompurify-html="$t('title', { name })"></span>
    </template>

    <schema-form
      v-if="model"
      class="scenario-manager--clone-form"
      :schema="schema"
      :layout="layout"
      :values="model"
      :validator="validator"
      :errors="errors"
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
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import Model from "../models/ScenarioName";

export default {
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  props: {
    name: {
      type: String,
      required: true,
    },
  },
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
    onSubmit() {
      const data = this.model.data;

      this.model
        .validate(data)
        .then(() => {
          this.$emit("submit", data);
        })
        .catch((errors) => {
          this.errors = errors;
        });
    },
    onCancel() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.scenario-manager--clone-form {
  ::v-deep(.input-wrapper) {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
