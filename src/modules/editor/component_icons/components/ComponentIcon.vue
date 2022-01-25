<template>
  <component :is="type" />
</template>

<script>
import Animation from "../assets/icons/Animation.svg?inline";
import NonSynchedBlock from "../assets/icons/Block.non-synched.svg?inline";
import SynchedBlock from "../assets/icons/Block.synched.svg?inline";
import BlockToggler from "../assets/icons/BlockToggler.svg?inline";
import Content from "../assets/icons/Content.svg?inline";
import Controller from "../assets/icons/Controller.svg?inline";
import Cursor from "../assets/icons/Cursor.svg?inline";
import MediaAudio from "../assets/icons/Media.audio.svg?inline";
import MediaVideo from "../assets/icons/Media.video.svg?inline";
import Page from "../assets/icons/Page.svg?inline";
import SVG from "../assets/icons/SVG.svg?inline";
import VideoRenderer from "../assets/icons/VideoRenderer.svg?inline";

export default {
  components: {
    Animation,
    NonSynchedBlock,
    SynchedBlock,
    BlockToggler,
    Content,
    Controller,
    Cursor,
    MediaAudio,
    MediaVideo,
    Page,
    SVG,
    VideoRenderer,
  },
  props: {
    component: {
      type: Object,
      required: true,
    },
  },
  computed: {
    type() {
      switch (this.component.type) {
        case "Scenario":
          return null;

        case "Block":
          return this.component.synched === "video"
            ? "SynchedBlock"
            : "NonSynchedBlock";

        case "Media":
          return this.component.tag === "video" ? "MediaVideo" : "MediaAudio";
      }

      return this.component.type;
    },
  },
};
</script>
