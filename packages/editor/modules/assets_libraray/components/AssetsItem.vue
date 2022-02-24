<i18n>
{
  "fr": {
    "delete_text": "Êtes-vous sûr de vouloir supprimer <em>{label}</em>\xa0?",
  },
  "en": {
    "delete_text": "Are you sure you want to delete <em>{label}</em>?",
  },
}
</i18n>

<template>
  <div
    :class="['assets-item', { dragging }]"
    draggable="true"
    @dragstart="onDragstart"
    @dragend="onDragend"
    @mouseover="onMouseover"
    @mouseout="onMouseout"
  >
    <figure>
      <img v-if="['image', 'svg'].includes(type)" :src="file.url" />
      <lottie-animation-icon
        v-else-if="type === 'lottie_animation'"
        :src="file.url"
        :play="play"
      />
      <component :is="`${type}-icon`" v-else class="icon" />

      <figcaption>{{ label }}</figcaption>
    </figure>

    <styled-button type="button" title="Supprimer" @click="onDeleteClick">
      <template #icon><delete-icon /></template>
    </styled-button>

    <confirm-dialog
      v-if="showDeleteConfirm"
      @submit="onDeleteSubmit"
      @cancel="onDeleteCancel"
    >
      <template #text>
        <p v-dompurify-html="$t('delete_text', { label })"></p>
      </template>
    </confirm-dialog>
  </div>
</template>

<script>
import { omit } from "lodash";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import { useStore } from "@metascore-library/core/module-manager";
import ImageIcon from "../assets/icons/image.svg?inline";
import AudioIcon from "../assets/icons/audio.svg?inline";
import VideoIcon from "../assets/icons/video.svg?inline";
import LottieAnimationIcon from "./LottieAnimationIcon.vue";
import DeleteIcon from "../assets/icons/delete.svg?inline";

export default {
  components: {
    ImageIcon,
    AudioIcon,
    VideoIcon,
    LottieAnimationIcon,
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
    const store = useStore("assets");
    const componentsStore = useStore("components");
    return { store, componentsStore };
  },
  data() {
    return {
      dragging: false,
      play: false,
      showDeleteConfirm: false,
    };
  },
  computed: {
    createComponent(data) {
      return this.componentsStore.create(data);
    },
    label() {
      return this.store.getName(this.asset);
    },
    file() {
      return this.store.getFile(this.asset);
    },
    type() {
      return this.store.getType(this.asset);
    },
    componentDragData() {
      const config = {
        name: this.label,
      };

      switch (this.type) {
        case "image":
          Object.assign(config, {
            type: "Content",
            "background-image": this.file.url,
            dimension: [this.file.width, this.file.height],
          });
          break;

        case "lottie_animation":
          Object.assign(config, {
            type: "Animation",
            src: this.file.url,
          });
          break;

        case "svg":
          Object.assign(config, {
            type: "SVG",
            src: this.file.url,
          });
          break;

        case "audio":
          Object.assign(config, {
            type: "Media",
            tag: this.type,
            src: this.file.url,
          });
          break;

        case "video":
          Object.assign(config, {
            type: "Media",
            tag: this.type,
            src: this.file.url,
            dimension: [this.file.width, this.file.height],
          });
          break;
      }

      const component = this.createComponent(config);
      const data = omit(component.toJson(), ["id"]);
      return JSON.stringify(data);
    },
    assetDragData() {
      return JSON.stringify(this.asset);
    },
    deleteText() {
      return this.$t("delete_text", { label: this.label });
    },
  },
  methods: {
    onDragstart(evt) {
      evt.dataTransfer.effectAllowed = "copy";
      evt.dataTransfer.setData(`metascore/component`, this.componentDragData);
      evt.dataTransfer.setData(`metascore/asset`, this.assetDragData);
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
      this.showDeleteConfirm = true;
    },
    onDeleteSubmit() {
      this.store.delete(this.asset.id);
      this.showDeleteConfirm = false;
    },
    onDeleteCancel() {
      this.showDeleteConfirm = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.assets-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 2.5em;
  padding: 0.25em;
  background-color: $lightgray;
  border-top: 1px solid $mediumgray;
  border-bottom: 1px solid $mediumgray;
  box-sizing: border-box;
  cursor: grab;

  figure {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1 1 auto;
    height: 100%;
    margin: 0;
    color: $mediumgray;
    pointer-events: none;

    img,
    svg,
    .lottie-animation-icon {
      display: block;
      flex: 0 0 2em;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      object-fit: contain;
    }

    .icon {
      width: 100%;
      height: 100%;
      color: $white;
      filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.5));
    }

    figcaption {
      flex: 1 1 auto;
      margin-left: 0.5em;
      color: $white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
    }
  }

  button {
    color: $white;
  }

  &::before {
    content: "";
    display: inline-block;
    width: 1em;
    height: 100%;
    margin-right: 0.5em;
    background: url(../assets/icons/drag-handle.svg) 50% 50% no-repeat;
    vertical-align: middle;
    opacity: 0.5;
  }

  &:hover,
  &.dragging {
    background-color: $mediumgray;

    figure {
      color: $darkgray;
    }
  }

  &.dragging {
    opacity: 0.5;
  }
}
</style>
