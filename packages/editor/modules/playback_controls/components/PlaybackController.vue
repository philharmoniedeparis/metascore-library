<i18n>
{
  "en": {
    "buttons": {
      "rewind": "Rewind",
      "pause": "Pause",
      "play": "Play",
    }
  },
  "fr": {
    "buttons": {
      "rewind": "Rembobiner",
      "pause": "Pause",
      "play": "Jouer",
    }
  },
}
</i18n>

<template>
  <div v-hotkey="hotkeys" class="playback-controller">
    <button type="button" class="rewind" @click="onRewindClick">
      <rewind-icon class="icon" aria-hidden="true" />
      <span class="sr-only">{{ $t("buttons.rewind") }}</span>
    </button>

    <button
      v-if="mediaPlaying"
      type="button"
      class="pause"
      @click="onPauseClick"
    >
      <pause-icon aria-hidden="true" class="icon" />
      <span class="sr-only">{{ $t("buttons.pause") }}</span>
    </button>
    <button v-else type="button" class="play" @click="onPlayClick">
      <play-icon aria-hidden="true" class="icon" />
      <span class="sr-only">{{ $t("buttons.play") }}</span>
    </button>
  </div>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";
import PlayIcon from "../assets/icons/play.svg?inline";
import PauseIcon from "../assets/icons/pause.svg?inline";
import RewindIcon from "../assets/icons/rewind.svg?inline";

export default {
  components: {
    PlayIcon,
    PauseIcon,
    RewindIcon,
  },
  setup() {
    const mediaStore = useModule("media").useStore();
    return { mediaStore };
  },
  computed: {
    mediaPlaying() {
      return this.mediaStore.playing;
    },
    hotkeys() {
      return {
        space: () => {
          if (this.mediaPlaying) {
            this.pauseMedia();
          } else {
            this.playMedia();
          }
        },
      };
    },
  },
  methods: {
    playMedia() {
      this.mediaStore.play();
    },
    pauseMedia() {
      this.mediaStore.pause();
    },
    seekMediaTo(time) {
      this.mediaStore.seekTo(time);
    },
    onRewindClick() {
      this.seekMediaTo(0);
    },
    onPlayClick() {
      this.playMedia();
    },
    onPauseClick() {
      this.pauseMedia();
    },
  },
};
</script>

<style lang="scss" scoped>
.playback-controller {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: space-evenly;
  align-items: center;
  flex: 1 1 auto;

  button {
    &.rewind {
      width: 2em;
      margin-right: 0.5em;
      padding: 0.5em;
      color: $white;
      filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.75));

      &:active {
        filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.25));
      }
    }

    &.play,
    &.pause {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4em;
      height: 4em;
      margin-right: 2.5em;
      padding: 0;
      background: $white;
      color: $mediumgray;
      border-radius: 50%;
      box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.5);

      .icon {
        width: 1.5em;
      }

      &:active {
        box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.25);
      }
    }
  }
}
</style>
