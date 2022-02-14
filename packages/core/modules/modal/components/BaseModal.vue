<i18n>
{
  "fr": {
    "close_title": "Fermer",
  },
  "en": {
    "close_title": "Close",
  },
}
</i18n>

<template>
  <transition name="fade">
    <div class="base-modal">
      <div class="backdrop" tabindex="-1" role="dialog">
        <div class="dialog" role="document">
          <div class="content">
            <div v-if="header || $slots.title || title" class="header">
              <h3 class="title">
                <slot v-if="$slots.title" name="title" />
                <template v-else>{{ title }} </template>
              </h3>
              <styled-button
                class="close no-bg"
                :title="$t('close_title')"
                :aria-label="$t('close_title')"
                @click="$emit('close')"
              >
                <template #icon><close-icon /></template>
              </styled-button>
            </div>
            <div class="body">
              <slot />
            </div>
            <div class="footer">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import CloseIcon from "../assets/icons/close.svg?inline";

export default {
  components: {
    CloseIcon,
  },
  props: {
    header: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
  },
  emits: ["close"],
};
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s linear;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.base-modal {
  .backdrop {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: 0;
    overflow-x: hidden;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999;
  }

  .dialog {
    display: flex;
    max-width: calc(100% - 1em);
    max-height: calc(100% - 1em);
    background: $mediumgray;
    border: 2px solid $lightgray;
    border-radius: 0.25em;
    box-shadow: 0 0 0.5em 0 rgb(0, 0, 0);
    box-sizing: border-box;
    overflow: hidden;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow-y: auto;
    overscroll-behavior-y: contain;
  }

  .header {
    display: flex;
    padding: 0.5em;
    justify-content: space-between;
    align-items: center;
    background: $darkgray;
    color: $white;

    .title {
      margin: 0;
      text-align: center;
      font-size: 1em;
      font-weight: 600;
    }

    ::v-deep(.styled-button) {
      font-size: 0.75em;
      color: $white;
    }
  }

  .body {
    padding: 1em;
    &.scroll {
      overflow-y: auto;
      overscroll-behavior-y: contain;
    }
  }

  .footer {
    display: flex;
    padding: 1em;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5em;
  }

  .body ~ .footer {
    padding-top: 0;
  }
}
</style>
