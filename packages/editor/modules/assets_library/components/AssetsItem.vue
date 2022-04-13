<i18n>
{
  "fr": {
    "loading_label": "En chargement ...",
    "delete_text": "Êtes-vous sûr de vouloir supprimer <em>{label}</em>\xa0?",
  },
  "en": {
    "loading_label": "Loading...",
    "delete_text": "Are you sure you want to delete <em>{label}</em>?",
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
      <template v-if="ready">
        <img v-if="['image', 'svg'].includes(type)" :src="file.url" />
        <animation-icon
          v-else-if="type === 'lottie_animation'"
          :src="file.url"
          :play="play"
        />
        <component :is="`${type}-icon`" v-else class="icon" />

        <figcaption>{{ label }}</figcaption>
      </template>
      <figcaption v-else>{{ $t("loading_label") }}</figcaption>
    </figure>

    <styled-button type="button" title="Supprimer" @click="onDeleteClick">
      <template #icon><delete-icon /></template>
    </styled-button>
    <confirm-dialog
      v-if="showDeleteConfirm"
      @submit="onDeleteSubmit"
      @cancel="onDeleteCancel"
    >
      <p v-dompurify-html="$t('delete_text', { label })"></p>
    </confirm-dialog>
  </div>
</template>

<script>
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import useStore from "../store";
import useEditorStore from "@metascore-library/editor/store";
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
    const editorStore = useEditorStore();
    return { store, editorStore };
  },
  data() {
    return {
      ready: false,
      component: null,
      dragging: false,
      play: false,
      showDeleteConfirm: false,
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
    assetDragData() {
      return JSON.stringify(this.asset);
    },
    deleteText() {
      return this.$t("delete_text", { label: this.label });
    },
  },
  watch: {
    "file.url"() {
      this.ready = false;
      this.setComponent().then(() => {
        this.ready = true;
      });
    },
  },
  mounted() {
    this.setComponent().then(() => {
      this.ready = true;
    });
  },
  methods: {
    async setComponent() {
      this.component = await new Promise((resolve) => {
        switch (this.type) {
          case "image":
            resolve({
              name: this.label,
              type: "Content",
              "background-image": this.file.url,
              dimension: [this.file.width, this.file.height],
            });
            break;

          case "lottie_animation":
            resolve({
              name: this.label,
              type: "Animation",
              src: this.file.url,
            });
            break;

          case "svg":
            {
              const obj = this.$el.ownerDocument.createElement("object");
              obj.classList.add("tmp");
              const component = {
                name: this.label,
                type: "SVG",
                src: this.file.url,
              };
              obj.addEventListener("load", (evt) => {
                const svg = evt.target.contentDocument.querySelector("svg");

                // Get colors.
                const colors = [];
                [".color1", ".color2"].map((c) => {
                  const el = svg.querySelector(c);
                  if (el) {
                    const style = getComputedStyle(el);
                    colors.push(style.fill);
                  }
                });
                if (colors.length > 0) {
                  component.colors = colors;
                } else {
                  component.stroke = null;
                  component["stroke-width"] = null;
                  component["stroke-dasharray"] = null;
                  component.fill = null;

                  // Get markers
                  const markers = [];
                  svg.querySelectorAll("defs marker").forEach((marker) => {
                    markers.push(marker.getAttribute("id"));
                  });
                  if (markers.length > 0) {
                    component.markers = markers;
                    component["marker-start"] = null;
                    component["marker-mid"] = null;
                    component["marker-end"] = null;
                  }
                }

                evt.target.remove();
                resolve(component);
              });
              obj.addEventListener("error", (evt) => {
                evt.target.remove();
                resolve(component);
              });
              obj.setAttribute("type", "image/svg+xml");
              obj.setAttribute("data", this.file.url);
              this.$el.appendChild(obj);
            }
            break;

          case "audio":
            resolve({
              name: this.label,
              type: "Media",
              tag: this.type,
              src: this.file.url,
            });
            break;

          case "video":
            resolve({
              name: this.label,
              type: "Media",
              tag: this.type,
              src: this.file.url,
              dimension: [this.file.width, this.file.height],
            });
            break;
        }
      });
    },
    onDragstart(evt) {
      evt.dataTransfer.effectAllowed = "copy";
      evt.dataTransfer.setData(
        `metascore/component:${this.component.type}`,
        JSON.stringify(this.component)
      );
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
.assets-library--asset-item {
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
    flex: 0 0 auto;
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

  ::v-deep(.tmp) {
    visibility: hidden;
    pointer-events: none;
  }
}
</style>
