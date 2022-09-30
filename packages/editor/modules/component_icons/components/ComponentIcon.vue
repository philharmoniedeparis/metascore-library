<template>
  <component :is="`${type}Icon`" class="icon component-icon" />
</template>

<script>
import AnimationIcon from "../assets/icons/Animation.svg?inline";
import NonSynchedBlockIcon from "../assets/icons/Block.non-synched.svg?inline";
import SynchedBlockIcon from "../assets/icons/Block.synched.svg?inline";
import BlockTogglerIcon from "../assets/icons/BlockToggler.svg?inline";
import ContentIcon from "../assets/icons/Content.svg?inline";
import ControllerIcon from "../assets/icons/Controller.svg?inline";
import CursorIcon from "../assets/icons/Cursor.svg?inline";
import MediaAudioIcon from "../assets/icons/Media.audio.svg?inline";
import MediaVideoIcon from "../assets/icons/Media.video.svg?inline";
import PageIcon from "../assets/icons/Page.svg?inline";
import SVGIcon from "../assets/icons/SVG.svg?inline";
import VideoRendererIcon from "../assets/icons/VideoRenderer.svg?inline";

export default {
  components: {
    AnimationIcon,
    NonSynchedBlockIcon,
    SynchedBlockIcon,
    BlockTogglerIcon,
    ContentIcon,
    ControllerIcon,
    CursorIcon,
    MediaAudioIcon,
    MediaVideoIcon,
    PageIcon,
    SVGIcon,
    VideoRendererIcon,
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
