<i18n>
{
  "fr": {
    "title": "Générer une image de spectrogramme",
    "image_fieldset": "Image",
    "apply_button": "Générer",
    "cancel_button": "Annuler",
  },
  "en": {
    "title": "Generate an audio spectrogram image",
    "image_fieldset": "Image",
    "apply_button": "Generate",
    "cancel_button": "Cancel",
  },
}
</i18n>

<template>
  <modal-form
    class="assets-library--spectrogram-form"
    :title="$t('title')"
    @submit="onSubmit"
    @close="onCancel"
  >
    <schema-form
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
import Model from "../models/Spectrogram";

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
        type: "vertical",
        items: [
          {
            type: "group",
            label: "Image",
            items: [
              {
                property: "width",
              },
              {
                property: "height",
              },
              {
                property: "mode",
              },
              {
                property: "legend",
              },
            ],
          },
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
      console.log(this.model.toJson());
    },
    onCancel() {
      this.$emit("close");
    },
  },
};
</script>
