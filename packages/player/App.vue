<i18n>
{
  "fr": {
    "loading_indicator_label": "créé avec <strong>metaScore</strong>",
    "contextmenu_footer_prefix": "créé avec",
  },
  "en": {
    "loading_indicator_label": "created with <strong>metaScore</strong>",
    "contextmenu_footer_prefix": "created with",
  },
}
</i18n>

<template>
  <div
    v-hotkey.prevent="hotkeys"
    class="metaScore-player"
    @contextmenu="onContextmenu"
  >
    <app-renderer
      :url="url"
      :responsive="responsive"
      :allow-upscaling="allowUpscaling"
    />

    <progress-indicator v-if="loading" class="loading-indicator">
      <template #text>
        <logo-mini />
        <p v-dompurify-html="$t('loading_indicator_label')"></p>
      </template>
    </progress-indicator>

    <context-menu
      v-model:show="showContextmenu"
      :position="contextmenuPosition"
    >
      <template #footer>
        <span class="prefix">{{ $t("contextmenu_footer_prefix") }}</span>
        <div @mousedown.prevent>
          <a
            href="https://metascore.philharmoniedeparis.fr/"
            target="_blank"
            :title="`metaScore ${version}`"
          >
            <logo />
          </a>
        </div>
      </template>
    </context-menu>
  </div>
</template>

<script>
import { computed } from "vue";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import useStore from "./store";
import { useModule } from "@metascore-library/core/services/module-manager";
import packageInfo from "../../package.json";
import Logo from "./assets/logo.svg?inline";
import LogoMini from "./assets/logo-mini.svg?inline";

export default {
  components: {
    Logo,
    LogoMini,
  },
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  provide() {
    return {
      modalsTarget: computed(() => this.modalsTarget),
    };
  },
  props: {
    url: {
      type: String,
      required: true,
    },
    keyboard: {
      type: Boolean,
      default: true,
    },
    responsive: {
      type: Boolean,
      default: false,
    },
    allowUpscaling: {
      type: Boolean,
      default: false,
    },
    api: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore();
    const { ready: appRendererReady } = useModule("app_renderer");
    const {
      playing: mediaPlaying,
      play: playMedia,
      pause: pauseMedia,
    } = useModule("media_player");
    return { store, appRendererReady, mediaPlaying, playMedia, pauseMedia };
  },
  data() {
    return {
      version: packageInfo.version,
      modalsTarget: null,
      showContextmenu: false,
      contextmenuPosition: { x: 0, y: 0 },
    };
  },
  computed: {
    loading() {
      return this.store.loading || !this.appRendererReady;
    },
    hotkeys() {
      if (!this.keyboard) return;

      return {
        space: ({ repeat }) => {
          if (repeat) return;

          if (this.mediaPlaying) this.pauseMedia();
          else this.playMedia();
        },
        left: () => {
          this.$el
            .querySelector(
              ".metaScore-component.block:hover .pager a[data-action='previous']"
            )
            ?.click();
        },
        right: () => {
          this.$el
            .querySelector(
              ".metaScore-component.block:hover .pager a[data-action='next']"
            )
            ?.click();
        },
      };
    },
  },
  mounted() {
    this.modalsTarget = this.$el;
    this.store.load(this.url);
  },
  methods: {
    onContextmenu(evt) {
      // Show the native menu if the shift key is down.
      if (evt.shiftKey) {
        return;
      }

      this.contextmenuPosition = {
        x: evt.pageX,
        y: evt.pageY,
      };
      this.showContextmenu = true;

      evt.preventDefault();
    },
  },
};
</script>

<style lang="scss">
@import "normalize.css";
@import "source-sans/source-sans-3VF.css";
@import "./scss/theme.scss";
</style>

<style lang="scss" scoped>
.metaScore-player {
  position: relative;
  display: flex;
  height: 100%;
  margin: 0;
  padding: 0;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-family: "Source Sans 3 VF", "Source Sans Variable", "Source Sans Pro",
    sans-serif;

  :deep(.loading-indicator) {
    .dialog {
      border: 0;
    }

    .body {
      padding: 0;
    }

    label {
      gap: 0;

      .text {
        display: flex;
        flex-direction: row;
        padding: 0.5em;
        align-items: center;
        gap: 0.5em;
        color: var(--metascore-color-text-primary);
        user-select: none;

        svg {
          width: 1em;
        }

        p {
          margin: 0;

          strong {
            font-weight: 600;
          }
        }
      }

      progress {
        width: 100%;
        height: 0.25em;
        margin: 0;
        border-radius: 0;
      }
    }
  }

  :deep(.context-menu) {
    > ul {
      padding: 0;
      background: var(--metascore-color-bg-primary);
    }

    .footer {
      display: flex;
      flex-direction: column;
      padding: 0;
      opacity: 1;

      .prefix {
        padding: 0.25em 0.5em;
        user-select: none;
      }

      a {
        display: block;
        padding: 0.5em;
        color: inherit;

        &:hover {
          color: var(--metascore-color-text-secondary);
          background-color: var(--metascore-color-bg-secondary);
        }
      }

      svg {
        display: block;
        width: 9em;
      }
    }
  }
}
</style>
