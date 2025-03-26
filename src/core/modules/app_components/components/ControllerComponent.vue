<i18n>
{
  "en": {
    "buttons": {
      "rewind": "Rewind",
      "pause": "Pause",
      "play": "Play"
    }
  },
  "fr": {
    "buttons": {
      "rewind": "Rembobiner",
      "pause": "Pause",
      "play": "Jouer"
    }
  }
}
</i18n>

<template>
  <component-wrapper :component="component">
    <div class="timer">{{ mediaFormattedTime }}</div>
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
import { useModule } from "@core/services/module-manager";
import RewindIcon from "../assets/icons/controller/rewind.svg?component";
import PlayIcon from "../assets/icons/controller/play.svg?component";
import PauseIcon from "../assets/icons/controller/pause.svg?component";
import LogoIcon from "../assets/icons/logo-metascore.svg?component";

export default {
  components: {
    RewindIcon,
    PlayIcon,
    PauseIcon,
    LogoIcon,
  },
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const {
      playing: mediaPlaying,
      formattedTime: mediaFormattedTime,
      play: playMedia,
      pause: pauseMedia,
      seekTo: seekMediaTo,
    } = useModule("media_player");
    return {
      mediaPlaying,
      mediaFormattedTime,
      playMedia,
      pauseMedia,
      seekMediaTo,
    };
  },
  methods: {
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
  > :deep(.metaScore-component--inner) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    color: rgb(221, 221, 221);
    font-weight: bold;
    overflow: hidden;
    user-select: none;
  }

  .timer {
    display: flex;
    width: 100%;
    flex: 0 0 2.75em;
    justify-content: center;
    align-items: center;
    color: var(--metascore-color-white, white);
    background-color: var(--metascore-color-accent, #0000fe);
    font-weight: 700;
    line-height: 2.7em;
  }

  .buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    flex: 1 1 auto;
    padding: 0 0.75em;
    gap: 0.5em;

    button {
      position: relative;
      padding: 0;
      color: var(--metascore-color-accent, #0000fe);
      box-sizing: border-box;

      span {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        .icon {
          display: block;
          width: 100%;
          height: 100%;
        }
      }

      &::after {
        content: "";
        display: block;
        padding-bottom: 100%;
      }

      &[data-action="rewind"] {
        flex: 1;
      }

      &[data-action="play"],
      &[data-action="pause"] {
        flex: 3;
        border: 0.5em solid #fff;
        border-radius: 50%;

        span {
          padding: 10%;
          box-sizing: border-box;
        }
      }

      &:hover {
        opacity: 0.75;
      }
    }

    &::after {
      content: "";
      flex: 1;
    }
  }

  .logo {
    width: 5.75em;
    align-self: center;
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
