<i18n>
{
  "fr": {
    "title": "Changer la source du média",
    "file_label": "Sélectionnez un fichier",
    "file_maxsize_description": "Le fichier doit peser moins de&nbsp;: {maxsize}",
    "file_types_description": "Formats pris en charge&nbsp;: {types}",
    "url_label": "Entrez l'URL d'un flux multimédia",
    "url_description": "Supported file types: {types}",
    "url_error": "The entered URL is invalid.",
    "required_error": "Veuillez remplir soit le champ fichier, soit le champ URL.",
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
    "url_error": "L'URL saisie n'est pas valide.",
    "required_error": "Please fill in either the file or the URL field.",
    "separator": "or",
    "apply_button": "Apply",
    "cancel_button": "Cancel",
  },
}
</i18n>

<template>
  <modal-form
    class="media-source-form"
    :title="$t('title')"
    @submit="onSubmit"
    @close="onCancel"
  >
    <form-group
      :label="$t('file_label')"
      label-for="media-source-form--file"
      :validation="v$.form.file"
    >
      <input
        id="media-source-form--file"
        v-focus
        type="file"
        :accept="formatedFileAccepts"
        @change="onFileChange"
      />

      <template #description>
        <p
          v-if="fileMaxsize"
          v-dompurify-html="
            $t('file_maxsize_description', { maxsize: fileMaxsize })
          "
        ></p>
        <p
          v-if="formatedFileAccepts"
          v-dompurify-html="
            $t('file_types_description', { types: formatedFileAccepts })
          "
        ></p>
      </template>
    </form-group>

    <div class="separator">{{ $t("separator") }}</div>

    <form-group
      :label="$t('url_label')"
      label-for="media-source-form--url"
      :validation="v$.form.url"
    >
      <input id="media-source-form--url" v-model="form.url" type="url" />

      <template #description>
        <p
          v-if="formatedUrlAccepts"
          v-dompurify-html="
            $t('url_description', { types: formatedUrlAccepts })
          "
        ></p>
      </template>
    </form-group>

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
import useVuelidate from "@vuelidate/core";
import { helpers, requiredUnless, url } from "@vuelidate/validators";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";

export default {
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
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
      type: [Array, Function],
      default() {
        return ["mp4", "mp3", "m3u8", "mpd"];
      },
    },
  },
  emits: ["submit", "close"],
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      form: {
        file: null,
        url: null,
      },
    };
  },
  computed: {
    formatedFileAccepts() {
      return this.fileAccepts.length > 0
        ? `.${this.fileAccepts.join(", .")}`
        : null;
    },
    formatedUrlAccepts() {
      return this.urlAccepts.length > 0
        ? `.${this.urlAccepts.join(", .")}`
        : null;
    },
  },
  validations() {
    return {
      form: {
        file: {
          required: helpers.withMessage(
            this.$t("required_error"),
            requiredUnless(this.form.url)
          ),
        },
        url: {
          required: helpers.withMessage(
            this.$t("required_error"),
            requiredUnless(this.form.file)
          ),
          url: helpers.withMessage(this.$t("url_error"), url),
        },
      },
    };
  },
  methods: {
    onFileChange(evt) {
      const files = evt.target.files || evt.dataTransfer.files;
      if (!files.length) {
        return;
      }

      this.form.file = files[0];
    },
    async onSubmit() {
      const valid = await this.v$.$validate();
      if (!valid) return;

      this.$emit("submit", this.form);
    },
    onCancel() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.media-source-form {
  .separator {
    margin: 1em 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: $white;
    text-transform: uppercase;

    &::before,
    &::after {
      content: "";
      display: block;
      flex: 1;
      height: 1px;
      background: $darkgray;
      margin: 0.5em;
    }
  }
}
</style>
