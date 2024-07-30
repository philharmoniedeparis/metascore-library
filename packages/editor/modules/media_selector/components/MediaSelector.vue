<i18n>
{
  "fr": {
    "title": "Changer la source du média",
    "loading_indicator_label": "Chargement ...",
    "needs_review": "La durée du média sélectionné ({new}) est inférieure à celui en cours ({old}).<br/><strong>Les pages commençant au-delà de {new} seront donc hors de portée.<br/>Cela concerne les blocs suivants&nbsp;: {blocks}.</strong><br/>Veuillez supprimer ces pages ou modifier leur temps de début et ré-essayer.",
    "shorter": "La durée du média sélectionné ({new}) est inférieure à celui en cours ({old}).<br/><strong>Il faudra probablement resynchroniser les pages et éléments dont le temps de fin est supérieur à celui du média sélectionné.</strong><br/>Etes-vous sûr que vous voulez utiliser le nouveau fichier&nbsp;?",
    "longer": "La durée du média sélectionné ({new}) est supérieure à celui en cours ({old}).<br/><strong>Il faudra probablement resynchroniser les pages et éléments dont le temps de fin est égal à celui du média en cours.</strong><br/>Etes-vous sûr que vous voulez utiliser le nouveau fichier&nbsp;?",
    "error": {
      "url": "Une erreur s’est produite.<br/>Veuillez vérifier l’URL et réessayer.",
      "generic": "Une erreur s’est produite.<br/>Veuillez réessayer plus tard.",
    },
  },
  "en": {
    "title": "Change media source",
    "loading_indicator_label": "Loading...",
    "needs_review": "The duration of selected media ({new}) is less than the current one ({old}).<br/><strong>Pages with a start time after {new} will therefore be out of reach.<br/>This applies to the following blocks: {blocks}.</strong><br/>Delete those pages or modify their start time and try again.",
    "shorter": "The duration of selected media ({new}) is less than the current one ({old}).<br/><strong>It will probably be necessary to resynchronize the pages and elements whose end time is greater than that of the selected media.</strong><br/>Are you sure you want to use the new media file?",
    "longer": "The duration of selected media ({new}) is greater than the current one ({old}).<br/><strong>It will probably be necessary to resynchronize the pages and elements whose end time is equal to that of the current media.</strong><br/>Are you sure you want to use the new media file?",
    "error": {
      "url": "An error occurred.<br/>Please check the URL and try again.",
      "generic": "An error occurred.<br/>Please try again later.",
    },
  },
}
</i18n>

<template>
  <div v-if="mediaSource" class="media-selector">
    <base-button
      v-tooltip
      type="button"
      :title="$t('title')"
      @click="showForm = true"
    >
      {{ mediaSource.name }}
    </base-button>

    <media-source-form
      v-if="showForm"
      @submit="onFormSubmit"
      @close="showForm = false"
    />

    <progress-indicator v-if="loading" :text="$t('loading_indicator_label')" />

    <alert-dialog v-if="alertMsg" @close="alertMsg = null">
      <p v-dompurify-html="alertMsg"></p>
    </alert-dialog>

    <confirm-dialog
      v-if="confirmMsg"
      @submit="onConfirmSubmit"
      @cancel="confirmMsg = null"
    >
      <p v-dompurify-html="confirmMsg"></p>
    </confirm-dialog>
  </div>
</template>

<script>
import { round } from "lodash";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import { useModule } from "@core/services/module-manager";
import MediaSourceForm from "./MediaSourceForm";

export default {
  components: {
    MediaSourceForm,
  },
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  setup() {
    const {
      source: mediaSource,
      setSource: setMediaSource,
      getMimeTypeFromURL,
      getFileDuration,
      duration: mediaDuration,
      formatTime,
    } = useModule("media_player");
    const { getComponentsByType, getComponentChildren } =
      useModule("app_components");
    return {
      mediaSource,
      setMediaSource,
      getMimeTypeFromURL,
      getFileDuration,
      mediaDuration,
      formatTime,
      getComponentsByType,
      getComponentChildren,
    };
  },
  data() {
    return {
      source: null,
      showForm: false,
      loading: false,
      alertMsg: null,
      confirmMsg: null,
    };
  },
  methods: {
    async onFormSubmit({ file, url }) {
      if (file) {
        this.source = {
          ...file,
          source: "upload",
        };
      } else if (url) {
        this.source = {
          name: new URL(url).pathname.split("/").pop(),
          url,
          mime: this.getMimeTypeFromURL(url),
          source: "url",
        };
      }

      try {
        this.loading = true;
        const valid = await this.validateSource(this.source);
        if (valid) this.updateSource();
      } catch (error) {
        this.alertMsg = this.$t(
          this.source.source === "url" ? "error.url" : "error.generic"
        );
        console.error(error);
        return;
      } finally {
        this.loading = false;
      }
    },
    onConfirmSubmit() {
      this.updateSource();
    },
    updateSource() {
      this.setMediaSource(this.source);
      this.source = null;
      this.showForm = false;
      this.alertMsg = null;
      this.confirmMsg = null;
    },
    async validateSource(source) {
      const old_duration = round(this.mediaDuration, 2);

      let new_duration = await this.getFileDuration(source);
      new_duration = round(new_duration, 2);

      if (new_duration < old_duration) {
        const blocks = [];
        this.getComponentsByType("Block").forEach((block) => {
          if (block.synched) {
            this.getComponentChildren(block).some((page) => {
              if (page["start-time"] > new_duration) {
                blocks.push(block);
                return true;
              }
            });
          }
        });

        if (blocks.length > 0) {
          this.alertMsg = this.$t("needs_review", {
            new: this.formatTime(new_duration),
            old: this.formatTime(old_duration),
            blocks: blocks.map((block) => block.name).join(", "),
          });
        } else {
          this.confirmMsg = this.$t("shorter", {
            new: this.formatTime(new_duration),
            old: this.formatTime(old_duration),
          });
        }
        return false;
      } else if (new_duration > old_duration) {
        this.confirmMsg = this.$t("longer", {
          new: this.formatTime(new_duration),
          old: this.formatTime(old_duration),
        });
        return false;
      }

      return true;
    },
  },
};
</script>

<style lang="scss" scoped>
.media-selector {
  :deep(.base-button) {
    display: block;
    width: 100%;
    padding: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
}
</style>
