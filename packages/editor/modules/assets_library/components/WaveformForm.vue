<i18n>
{
  "fr": {
    "title": "Générer une image de forme d'onde",
    "image_group_label": "Image",
    "width_label": "Largeur",
    "height_label": "Hauteur",
    "split_channels_label": "Séparer les canaux",
    "no_axis_labels_label": "Pas d'étiquettes d'axe",
    "time_group_label": "Temps",
    "start_label": "Temps de début",
    "end_label": "Temps de fin",
    "color_group_label": "Couleur",
    "background_color_label": "Couleur de fond",
    "waveform_color_label": "Couleur de la forme d'onde",
    "axis_label_label": "Couleur des étiquettes",
    "border_color_label": "Couleur de bordure",
    "apply_button": "Générer",
    "cancel_button": "Annuler",
  },
  "en": {
    "title": "Generate an audio waveform image",
    "image_group_label": "Image",
    "width_label": "Width",
    "height_label": "Height",
    "split_channels_label": "Split channels",
    "no_axis_labels_label": "No axis labels",
    "time_group_label": "Time",
    "start_label": "Start time",
    "end_label": "End time",
    "color_group_label": "Color",
    "background_color_label": "Background color",
    "waveform_color_label": "Waveform color",
    "axis_label_label": "Axis label color",
    "border_color_label": "Border color",
    "apply_button": "Generate",
    "cancel_button": "Cancel",
  },
}
</i18n>

<template>
  <modal-form :title="$t('title')" @submit="onSubmit" @close="onCancel">
    <schema-form
      class="assets-library--waveform-form"
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
import Model from "../models/Waveform";

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
            label: this.$t("image_group_label"),
            items: [
              { property: "width", label: this.$t("width_label") },
              { property: "height", label: this.$t("height_label") },
              {
                property: "split-channels",
                label: this.$t("split_channels_label"),
              },
              {
                property: "no-axis-labels",
                label: this.$t("no_axis_labels_label"),
              },
            ],
          },
          {
            type: "group",
            label: this.$t("time_group_label"),
            items: [
              { property: "start", label: this.$t("start_label") },
              { property: "end", label: this.$t("end_label") },
            ],
          },
          {
            type: "group",
            label: this.$t("color_group_label"),
            items: [
              {
                property: "background-color",
                label: this.$t("background_color_label"),
              },
              {
                property: "waveform-color",
                label: this.$t("waveform_color_label"),
              },
              {
                property: "axis-label-color",
                label: this.$t("axis_label_label"),
              },
              {
                property: "border-color",
                label: this.$t("border_color_label"),
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

<style lang="scss" scoped>
.assets-library--waveform-form {
  ::v-deep(fieldset) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.5em 1em;

    .form-group.number {
      input {
        width: 6em;
      }
    }
  }
}
</style>
