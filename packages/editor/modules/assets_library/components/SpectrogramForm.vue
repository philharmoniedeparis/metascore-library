<i18n>
{
  "fr": {
    "title": "Générer une image de spectrogramme",
    "image_group_label": "Image",
    "width_label": "Largeur",
    "height_label": "Hauteur",
    "mode_label": "Canaux",
    "legend_label": "Dessiner une légende",
    "time_group_label": "Temps",
    "start_time_label": "Temps de début",
    "end_time_label": "Temps de fin",
    "scale_group_label": "Échelle",
    "scale_label": "Échelle",
    "start_label": "Fréquence minimale (Hz)",
    "stop_label": "Fréquence maximale (Hz)",
    "color_group_label": "Couleur",
    "color_label": "Mode",
    "gain_label": "Gain",
    "saturation_label": "Saturation",
    "rotation_label": "Rotation",
    "algorithm_group_label": "Algorithme",
    "win_func_label": "Fenêtrage",
    "apply_button": "Générer",
    "cancel_button": "Annuler",
  },
  "en": {
    "title": "Generate an audio spectrogram image",
    "image_group_label": "Image",
    "width_label": "Width",
    "height_label": "Height",
    "mode_label": "Channels",
    "legend_label": "Draw legend",
    "time_group_label": "Time",
    "start_time_label": "Start time",
    "end_time_label": "End time",
    "scale_group_label": "Scale",
    "scale_label": "Scale",
    "start_label": "Min frequency (Hz)",
    "stop_label": "Max frequency (Hz)",
    "color_group_label": "Color",
    "color_label": "mode",
    "gain_label": "Gain",
    "saturation_label": "Saturation",
    "rotation_label": "Rotation",
    "algorithm_group_label": "Algorithm",
    "win_func_label": "Window function",
    "apply_button": "Generate",
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
      class="assets-library--spectrogram-form"
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
import Model from "../models/Spectrogram";

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
              { property: "mode", label: this.$t("mode_label") },
              { property: "legend", label: this.$t("legend_label") },
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
                property: "start_time",
                label: this.$t("start_time_label"),
                inButton: true,
                clearButton: true,
              },
              {
                property: "end_time",
                label: this.$t("end_time_label"),
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
                content: this.$t("scale_group_label"),
              },
              { property: "scale", label: this.$t("scale_label") },
              { property: "start", label: this.$t("start_label") },
              { property: "stop", label: this.$t("stop_label") },
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
              { property: "color", label: this.$t("color_label") },
              { property: "gain", label: this.$t("gain_label") },
              { property: "saturation", label: this.$t("saturation_label") },
              { property: "rotation", label: this.$t("rotation_label") },
            ],
          },
          {
            type: "markup",
            tag: "fieldset",
            items: [
              {
                type: "markup",
                tag: "legend",
                content: this.$t("algorithm_group_label"),
              },
              { property: "win_func", label: this.$t("win_func_label") },
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
      try {
        let data = await this.model.validate(this.model.data);
        data = { ...toRaw(data) };

        data.size = `${data.width}x${data.height}`;
        delete data.width;
        delete data.height;

        data.legend = data.legend ? 1 : 0;

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
.assets-library--spectrogram-form {
  :deep(fieldset) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.5em 1em;
    margin-bottom: 0.5em;
    padding: 0 1em;
    border: 1px solid var(--metascore-color-bg-primary);

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

    .form-group[data-property="scale"] {
      grid-column: 1 / span 2;
    }
  }
}
</style>
