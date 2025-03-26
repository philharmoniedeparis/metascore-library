<i18n>
{
  "fr": {
    "title": "Générer une image de forme d’onde",
    "image_group_label": "Image",
    "width_label": "Largeur",
    "height_label": "Hauteur",
    "split_channels_label": "Séparer les canaux",
    "no_axis_labels_label": "Pas d’étiquettes d’axe",
    "time_group_label": "Temps",
    "start_label": "Temps de début",
    "end_label": "Temps de fin",
    "color_group_label": "Couleur",
    "background_color_label": "Couleur de fond",
    "waveform_color_label": "Couleur de la forme d’onde",
    "axis_label_label": "Couleur des étiquettes",
    "border_color_label": "Couleur de bordure",
    "apply_button": "Générer",
    "cancel_button": "Annuler"
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
    "cancel_button": "Cancel"
  }
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
      class="assets-library--waveform-form"
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
import { toRaw } from "vue";
import Model from "../models/Audiowaveform";

export default {
  props: {
    defaults: {
      type: Object,
      default: () => {
        return {};
      },
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
          {
            type: "markup",
            tag: "fieldset",
            items: [
              {
                type: "markup",
                tag: "legend",
                content: this.$t("image_group_label"),
              },
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
            type: "markup",
            tag: "fieldset",
            items: [
              {
                type: "markup",
                tag: "legend",
                content: this.$t("time_group_label"),
              },
              {
                property: "start",
                label: this.$t("start_label"),
                inButton: true,
                clearButton: true,
              },
              {
                property: "end",
                label: this.$t("end_label"),
                inButton: true,
                clearButton: true,
              },
            ],
          },
          {
            type: "markup",
            tag: "fieldset",
            items: [
              {
                type: "markup",
                tag: "legend",
                content: this.$t("color_group_label"),
              },
              {
                property: "background-color",
                label: this.$t("background_color_label"),
                format: "hex",
              },
              {
                property: "waveform-color",
                label: this.$t("waveform_color_label"),
                format: "hex",
                required: true,
              },
              {
                property: "axis-label-color",
                label: this.$t("axis_label_label"),
                format: "hex",
              },
              {
                property: "border-color",
                label: this.$t("border_color_label"),
                format: "hex",
              },
            ],
          },
        ],
      };
    },
  },
  async mounted() {
    this.model = await Model.create(this.defaults);
  },
  methods: {
    onUpdate({ property, value }) {
      this.model.update({ [property]: value }, false);
    },
    async onSubmit() {
      this.errors = null;

      try {
        let data = await this.model.validate(this.model.data);
        data = { ...toRaw(data) };

        if (!data.end) {
          data.zoom = "auto";
          delete data.end;
        }

        ["split-channels", "no-axis-labels"].forEach((key) => {
          data[key] = data[key] ? 1 : 0;
        });

        [
          "background-color",
          "waveform-color",
          "axis-label-color",
          "border-color",
        ].forEach((key) => {
          data[key] = data[key]?.replace("#", "") ?? "00000000";
        });

        this.$emit("submit", data);
      } catch (error) {
        this.errors = error;
        console.error(error);
      }
    },
    onCancel() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.assets-library--waveform-form {
  :deep(fieldset) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.5em 1em;
    margin-bottom: 0.5em;
    padding: 0 1em;
    border: 1px solid var(--metascore-color-bg-tertiary);

    > legend {
      display: inline-block;
      width: auto;
      padding: 0.25em 0.5em;
      color: var(--metascore-color-white);
      text-align: left;
    }

    .form-group.number {
      input {
        width: 6em;
      }
    }
  }
}
</style>
