<i18n>
{
  "fr": {
    "delete_text": "Êtes-vous sûr de vouloir supprimer <em>{label}</em>\xa0?",
    "usage_text": "<em>{label}</em> ne peut pas être supprimé car elle est utilisée dans les composants suivants&nbsp: <em>{components}</em>.",
  },
  "en": {
    "delete_text": "Are you sure you want to delete <em>{label}</em>?",
    "usage_text": "<em>{label}</em> cannot be deleted as it is being used in the following components: <em>{components}</em>."
  },
}
</i18n>

<template>
  <div
    :class="['assets-library--asset-item', { dragging }]"
    draggable="true"
    @dragstart="onDragstart"
    @dragend="onDragend"
    @mouseover="onMouseover"
    @mouseout="onMouseout"
  >
    <figure>
      <img v-if="['image', 'svg'].includes(type)" :src="file.url" />
      <animation-icon
        v-else-if="type === 'lottie_animation'"
        :src="file.url"
        :play="play"
      />
      <component :is="`${type}-icon`" v-else class="icon" />

      <figcaption>{{ label }}</figcaption>
    </figure>

    <base-button type="button" title="Supprimer" @click="onDeleteClick">
      <template #icon><delete-icon /></template>
    </base-button>
    <confirm-dialog
      v-if="showDeleteConfirm"
      @submit="onDeleteSubmit"
      @cancel="onDeleteCancel"
    >
      <p v-dompurify-html="$t('delete_text', { label })"></p>
    </confirm-dialog>
    <alert-dialog v-if="showUsageAlert" @close="onUsageClose">
      <p
        v-dompurify-html="
          $t('usage_text', { label, components: usageNames.join(', ') })
        "
      ></p>
    </alert-dialog>
  </div>
</template>

<script>
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "../store";
import ImageIcon from "../assets/icons/image.svg?inline";
import AudioIcon from "../assets/icons/audio.svg?inline";
import VideoIcon from "../assets/icons/video.svg?inline";
import AnimationIcon from "./AnimationIcon.vue";
import DeleteIcon from "../assets/icons/delete.svg?inline";

export default {
  components: {
    ImageIcon,
    AudioIcon,
    VideoIcon,
    AnimationIcon,
    DeleteIcon,
  },
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  props: {
    asset: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const { getModelByType } = useModule("app_components");
    return { store, getModelByType };
  },
  data() {
    return {
      dragging: false,
      play: false,
      showDeleteConfirm: false,
      showUsageAlert: false,
    };
  },
  computed: {
    label() {
      return this.store.getName(this.asset);
    },
    file() {
      return this.store.getFile(this.asset);
    },
    type() {
      return this.store.getType(this.asset);
    },
    component() {
      switch (this.type) {
        case "image": {
          const data = {
            name: this.label,
            type: "Content",
            "background-image": this.file.url,
          };
          if (this.file.width && this.file.height) {
            data.dimension = [this.file.width, this.file.height];
          }
          return data;
        }

        case "lottie_animation":
          return {
            name: this.label,
            type: "Animation",
            src: this.file.url,
          };

        case "svg":
          return {
            name: this.label,
            type: "SVG",
            src: this.file.url,
          };

        case "audio":
          return {
            name: this.label,
            type: "Media",
            tag: this.type,
            src: this.file.url,
          };

        case "video": {
          const data = {
            name: this.label,
            type: "Media",
            tag: this.type,
            src: this.file.url,
          };
          if (this.file.width && this.file.height) {
            data.dimension = [this.file.width, this.file.height];
          }
          return data;
        }

        default:
          return null;
      }
    },
    assetDragData() {
      return JSON.stringify(this.asset);
    },
    deleteText() {
      return this.$t("delete_text", { label: this.label });
    },
    usage() {
      return this.store.getUsage(this.asset);
    },
    usageNames() {
      return this.usage.map((c) => c.name);
    },
  },
  methods: {
    onDragstart(evt) {
      const model = this.getModelByType(this.component.type);

      evt.dataTransfer.effectAllowed = "copy";
      evt.dataTransfer.setData(model.mime, JSON.stringify(this.component));
      evt.dataTransfer.setData(
        `metascore/asset;type=${this.type}`,
        this.assetDragData
      );
      evt.dataTransfer.setData("text/uri-list", this.file.url);
      evt.dataTransfer.setData("text/plain", this.file.url);
      if (this.type === "image") {
        if ("width" in this.file && "height" in this.file) {
          evt.dataTransfer.setData(
            "text/html",
            `<img src="${this.file.url}" width="${this.file.width}" height="${this.file.height}" />`
          );
        } else {
          evt.dataTransfer.setData(
            "text/html",
            `<img src="${this.file.url}" />`
          );
        }
      }

      this.play = false;
      this.dragging = true;
    },
    onDragend() {
      this.dragging = false;
    },
    onMouseover() {
      this.play = true;
    },
    onMouseout() {
      this.play = false;
    },
    onDeleteClick() {
      if (this.usage.length > 0) {
        this.showUsageAlert = true;
      } else {
        this.showDeleteConfirm = true;
      }
    },
    onDeleteSubmit() {
      this.store.delete(this.asset.id);
      this.showDeleteConfirm = false;
    },
    onDeleteCancel() {
      this.showDeleteConfirm = false;
    },
    onUsageClose() {
      this.showUsageAlert = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.assets-library--asset-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 2.5em;
  padding: 0.25em;
  background-color: var(--metascore-color-bg-primary);
  border-top: 1px solid var(--metascore-color-bg-secondary);
  border-bottom: 1px solid var(--metascore-color-bg-secondary);
  box-sizing: border-box;
  cursor: grab;

  figure {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1 1 auto;
    height: 100%;
    margin: 0;
    color: var(--metascore-color-bg-secondary);
    overflow: hidden;
    pointer-events: none;

    img,
    svg,
    .lottie-animation-icon {
      display: block;
      flex: 0 0 auto;
      width: 2em;
      height: 100%;
      box-sizing: border-box;
      object-fit: contain;
    }

    .icon {
      color: var(--metascore-color-white);
      filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.5));
    }

    figcaption {
      flex: 1 1 auto;
      margin-left: 0.5em;
      color: var(--metascore-color-white);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
    }
  }

  button {
    color: var(--metascore-color-white);
  }

  &::before {
    content: "";
    display: inline-block;
    width: 1em;
    height: 100%;
    flex: 0 0 auto;
    margin-right: 0.5em;
    background: url(../assets/icons/drag-handle.svg) 50% 50% no-repeat;
    vertical-align: middle;
    opacity: 0.5;
  }

  &:hover,
  &.dragging {
    background-color: var(--metascore-color-bg-secondary);

    figure {
      color: var(--metascore-color-bg-tertiary);
    }
  }

  &.dragging {
    opacity: 0.5;
  }

  :deep(.tmp) {
    visibility: hidden;
    pointer-events: none;
  }
}
</style>
