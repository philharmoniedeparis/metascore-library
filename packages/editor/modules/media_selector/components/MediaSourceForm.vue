<i18n>
{
  "fr": {
    "title": "Changer la source du média",
    "file_label": "Sélectionnez un fichier",
    "file_maxsize_description": "Le fichier doit peser moins de&nbsp;: {maxsize}",
    "file_types_description": "Formats pris en charge&nbsp;: {types}",
    "url_label": "Entrez l'URL d'un flux multimédia",
    "url_description": "Formats pris en charge: {types}",
    "separator": "ou",
    "apply_button": "Appliquer",
    "cancel_button": "Annuler",
  },
  "en": {
    "title": "Change media source",
    "file_label": "Select a file",
    "file_maxsize_description": "File must be less than: {maxsize}",
    "file_types_description": "Supported file types: {types}",
    "url_label": "Enter a media stream URL",
    "url_description": "Formats pris en charge&nbsp;: {types}",
    "separator": "or",
    "apply_button": "Apply",
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
      class="media-source-form"
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
import Model from "../models/MediaSource";

export default {
  props: {
    fileAccepts: {
      type: Array,
      default() {
        return ["mp4", "mp3"];
      },
    },
    fileMaxsize: {
      type: Number,
      default: null,
    },
    urlAccepts: {
      type: Array,
      default() {
        return ["mp4", "mp3", "m3u8", "mpd"];
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
            property: "file",
            label: this.$t("file_label"),
            accept: this.formatedFileAccepts,
            description: this.fileDescription,
          },
          { type: "markup", content: this.$t("separator"), class: "separator" },
          {
            property: "url",
            label: this.$t("url_label"),
            description: this.$t("url_description", {
              types: this.formatedUrlAccepts,
            }),
          },
        ],
      };
    },
    formatedFileAccepts() {
      return this.fileAccepts.length > 0
        ? `.${this.fileAccepts.join(", .")}`
        : null;
    },
    fileDescription() {
      let description = "";

      if (this.fileMaxsize) {
        description += this.$t("file_maxsize_description", {
          maxsize: this.fileMaxsize,
        });
      }

      if (this.fileAccepts.length > 0) {
        description += this.$t("file_types_description", {
          types: this.formatedFileAccepts,
        });
      }

      return description;
    },
    formatedUrlAccepts() {
      return this.urlAccepts.length > 0
        ? `.${this.urlAccepts.join(", .")}`
        : null;
    },
    urlDescription() {
      if (this.urlAccepts.length > 0) {
        return this.$t("url_description", {
          types: this.formatedUrlAccepts,
        });
      }

      return null;
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
.media-source-form {
  :deep(.form-group) {
    .input-wrapper {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  :deep(.separator) {
    margin: 1em 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
    color: $white;
    text-transform: uppercase;

    &::before,
    &::after {
      content: "";
      display: block;
      flex: 1;
      height: 1px;
      background: $darkgray;
    }
  }
}
</style>
