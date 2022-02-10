<template>
  <div class="metaScore-editor">
    <resizable-pane class="top">
      <main-menu />
    </resizable-pane>

    <resizable-pane class="left" :right="true">
      <tabs-container>
        <tabs-item title="Components"><components-library /></tabs-item>
        <tabs-item title="Library"><assets-library /></tabs-item>
        <tabs-item title="Shared Library"><shared-assets-library /></tabs-item>
      </tabs-container>
    </resizable-pane>

    <resizable-pane class="center">
      <dynamic-ruler :track-target="rulersTrackTarget" />
      <dynamic-ruler axis="y" :track-target="rulersTrackTarget" />
      <player-preview
        :url="url"
        :style="{ width: `${playerWidth}px`, height: `${playerHeight}px` }"
        @load="onPlayerPreviewLoad"
      />
    </resizable-pane>

    <resizable-pane class="right" :left="true">
      <component-form></component-form>
    </resizable-pane>

    <resizable-pane class="bottom" :top="true">
      <div class="top">
        <playback-time />
        <waveform-overview />
      </div>
      <div class="middle">
        <div class="sticky-top">
          <playback-controller />
          <waveform-zoom />
        </div>
        <components-timeline />
      </div>
      <div class="bottom">
        <scenario-selector />
      </div>
    </resizable-pane>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      rulersTrackTarget: null,
    };
  },
  computed: {
    ...mapState("app-renderer", {
      playerWidth: "width",
      playerHeight: "height",
    }),
  },
  methods: {
    onPlayerPreviewLoad({ iframe }) {
      this.rulersTrackTarget = iframe.contentDocument.body;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "normalize.css";
@import "source-sans/source-sans-3VF.css";

$controller-top-height: 2.5em;
$controller-left-width: 12em;
$controller-bottom-sticky-top-height: 8em;
$controller-bottom-sticky-bottom-height: 1.5em;

.metaScore-editor {
  font-size: 14px;
  font-family: "Source Sans 3 VF", "Source Sans Variable", "Source Sans Pro",
    sans-serif;
  display: grid;
  height: 100%;
  margin: 0;
  padding: 0;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: min-content 1fr auto;
  grid-template-areas:
    "top top top"
    "left center right"
    "bottom bottom bottom";
  align-items: stretch;
  flex-wrap: nowrap;

  * {
    scrollbar-color: $scrollbar-thumb-color $scrollbar-track-color;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
      appearance: none;
      background-color: $scrollbar-track-color;
      width: $scrollbar-width;
      height: $scrollbar-thumb-min-height;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 0;
      background-color: $scrollbar-thumb-color;

      &:active,
      &:hover {
        background-color: $scrollbar-thumb-active-color;
      }
    }
  }

  ::v-deep(.sr-only) {
    @include sr-only;
  }

  ::v-deep(button) {
    background: none;
    border: none;
    opacity: 0.5;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  ::v-deep(input, select) {
    font-family: inherit;
    color: inherit;

    &:not([type]),
    &[type=""],
    &[type="text"],
    &[type="number"] {
      border-radius: 0.25em;
    }

    &:not([type="checkbox"]):not([type="radio"]) {
      padding: 0.25em 0.5em;
      background: $mediumgray;
      border: none;
      box-sizing: border-box;
    }

    &:focus {
      background: $darkgray;
      box-shadow: 0 0 1px 1px rgba(255, 255, 255, 0.5);
      outline: none;
    }
  }

  ::v-deep(.icon) {
    display: block;
  }

  > .top {
    grid-area: top;
    height: 2.5em;
    background: $darkgray;
  }

  > .left {
    grid-area: left;
    width: 20em;
    min-width: 15em;
    max-width: 25vw;
    border-right: 0.5em solid $darkgray;
  }

  > .center {
    grid-area: center;
    display: grid;
    width: 100%;
    grid-template-columns: 20px auto min-content auto;
    grid-template-rows: 20px auto min-content auto;
    box-sizing: border-box;
    overflow: auto;
  }

  > .right {
    grid-area: right;
    width: 20em;
    min-width: 15em;
    max-width: 25vw;
    border-left: 0.5em solid $darkgray;
  }

  > .bottom {
    grid-area: bottom;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    height: 300px;
    min-height: 150px;
    max-height: 75vh;
    border-top: 0.5em solid $darkgray;
    overflow-y: hidden;
    overflow-y: hidden;

    > .top {
      display: flex;
      flex-direction: row;
      flex: 0 0 $controller-top-height;
      background: $mediumgray;
      border-bottom: 2px solid $darkgray;
      z-index: 1;

      .playback-time {
        display: flex;
        flex: 0 0 $controller-left-width;
        box-sizing: border-box;
        border-right: 2px solid $darkgray;
      }

      .waveform-overview {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
    }

    > .middle {
      flex: 1 1 auto;
      overflow: hidden;
      position: relative;
      overflow-y: scroll;
      scroll-behavior: smooth;

      > .sticky-top {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: $controller-bottom-sticky-top-height;
        display: flex;
        flex-direction: row;
        background: $lightgray;
        border-bottom: 2px solid $darkgray;
        z-index: 4;

        > .playback-controller {
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
          width: $controller-left-width;
          flex: 0 0 auto;
          box-sizing: border-box;
          border-right: 1px solid $darkgray;
        }

        > .waveform-zoom {
          flex: 1 1 auto;
          border-left: 1px solid $darkgray;
        }
      }
    }

    > .bottom {
      display: flex;
      flex-direction: row;
      flex: 0 0 $controller-bottom-sticky-bottom-height;
      background: $mediumgray;
      border-top: 1px solid $darkgray;
      z-index: 1;

      .scenario-selector {
        flex: 1 1 auto;
      }

      .zoom-controls {
        flex: 0 0 auto;
        background: $darkgray;
      }
    }
  }

  .dynamic-ruler {
    position: sticky;
    z-index: 1;
    background: $mediumgray;

    &[data-axis="x"] {
      top: 0;
      grid-area: 1/2/2/5;
      padding-top: 2px;
    }

    &[data-axis="y"] {
      left: 0;
      grid-area: 2/1/5/2;
      padding-left: 2px;
    }
  }

  .player-preview {
    grid-area: 3/3/4/4;
    overflow: hidden;
  }
}
</style>
