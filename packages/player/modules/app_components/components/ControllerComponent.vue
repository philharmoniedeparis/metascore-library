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
  <component-wrapper :model="model" class="controller">
    <div class="timer">{{ mediaTime }}</div>
    <div class="buttons">
      <button type="button" data-action="rewind" @click="onRewindClick">
        <span aria-hidden="true"><rewind-icon class="icon" /></span>
        <span class="sr-only">{{ $t("buttons.rewind") }}</span>
      </button>

      <button
        v-if="mediaPlaying"
        type="button"
        data-action="pause"
        @click="onPauseClick"
      >
        <span aria-hidden="true"><pause-icon class="icon" /></span>
        <span class="sr-only">{{ $t("buttons.pause") }}</span>
      </button>
      <button v-else type="button" data-action="play" @click="onPlayClick">
        <span aria-hidden="true"><play-icon class="icon" /></span>
        <span class="sr-only">{{ $t("buttons.play") }}</span>
      </button>
    </div>
    <div class="logo"><logo-icon /></div>
  </component-wrapper>
</template>

<script>
import { mapGetters, mapState, mapActions } from "vuex";
import RewindIcon from "../assets/icons/controller/rewind.svg?inline";
import PlayIcon from "../assets/icons/controller/play.svg?inline";
import PauseIcon from "../assets/icons/controller/pause.svg?inline";
import LogoIcon from "../assets/icons/logo-metascore.svg?inline";

export default {
  components: {
    RewindIcon,
    PlayIcon,
    PauseIcon,
    LogoIcon,
  },
  props: {
    /**
     * The associated component model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState("media", {
      mediaPlaying: "playing",
    }),
    ...mapGetters("media", {
      mediaTime: "formattedTime",
    }),
  },
  methods: {
    ...mapActions("media", {
      playMedia: "play",
      pauseMedia: "pause",
      seekMediaTo: "seekTo",
    }),
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
.controller {
  & > .metaScore-component--inner {
    display: flex;
    width: 90px;
    height: 100px;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    color: rgb(221, 221, 221);
    font-weight: bold;
    background-color: rgb(204, 204, 204);
    border-radius: 10px;
    overflow: hidden;
    user-select: none;
  }

  .timer {
    display: flex;
    width: 100%;
    flex: 0 0 2.75em;
    justify-content: center;
    align-items: center;
    background-color: $metascore-color;
  }

  .buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    button {
      color: $metascore-color;

      &[data-action="rewind"] {
        padding: 0.5em;
      }

      &[data-action="play"],
      &[data-action="pause"] {
        display: flex;
        width: 3.7em;
        height: 3.7em;
        margin-right: 1.75em;
        padding: 0.75em;
        align-items: center;
        justify-content: center;
        border: 0.5em solid #fff;
        border-radius: 50%;
      }

      &[data-action="rewind"] {
        width: 1.75em;
        padding: 0.5em;
      }

      &:hover {
        opacity: 0.75;
      }
    }
  }

  .logo {
    width: 5.75em;
    opacity: 0.5;
  }

  &.playing {
    .buttons {
      button {
        &[data-action="play"] {
          background-position: -94px 0;
        }
      }
    }
  }
}
</style>
