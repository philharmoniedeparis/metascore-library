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
  <!-- The wrapper is used as a work-around to pass classes from the parent component to the actual modal -->
  <div :class="['base-modal-wrapper', { teleport }]">
    <teleport :to="teleportTarget" :disabled="!teleport || !teleportTarget">
      <transition name="fade">
        <div class="base-modal" v-bind="$attrs">
          <div class="backdrop" tabindex="-1" role="dialog">
            <div class="dialog" role="document">
              <div class="content">
                <div v-if="header || $slots.title || title" class="header">
                  <h3 v-if="$slots.title || title" class="title">
                    <slot v-if="$slots.title" name="title" />
                    <template v-else>{{ title }} </template>
                  </h3>
                  <base-button
                    class="close no-bg"
                    :title="$t('close_title')"
                    :aria-label="$t('close_title')"
                    @click="$emit('close')"
                  >
                    <template #icon><close-icon /></template>
                  </base-button>
                </div>

                <div class="body">
                  <slot />

                  <div v-if="$slots.footer" class="footer">
                    <slot name="footer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import CloseIcon from "../assets/icons/close.svg?inline";

export default {
  components: {
    CloseIcon,
  },
  inject: {
    modalsTarget: {
      default: "body",
    },
  },
  props: {
    target: {
      type: [String, HTMLElement, Boolean],
      default: null,
    },
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
  computed: {
    teleport() {
      return this.target !== false;
    },
    teleportTarget() {
      return this.target ?? this.modalsTarget;
    },
  },
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

.base-modal-wrapper {
  &.teleport {
    display: none;
  }
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
    background: var(--color-bg-tertiary);
    border: 2px solid var(--color-bg-tertiary);
    border-radius: 0.25em;
    box-shadow: 0 0 0.5em 0 rgb(0, 0, 0);
    box-sizing: border-box;
    overflow: hidden;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .header {
    display: flex;
    padding: 0.5em;
    justify-content: space-between;
    align-items: center;
    background: var(--color-bg-primary);
    color: var(--color-white);

    .title {
      margin: 0;
      text-align: center;
      font-size: 1em;
      font-weight: 600;
    }

    :deep(.base-button) {
      font-size: 0.75em;
    }
  }

  .body {
    padding: 1em;
    overflow-y: auto;
    overscroll-behavior-y: contain;
  }

  .footer {
    display: flex;
    padding: 1em;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5em;

    :deep(.base-button) {
      background: var(--color-bg-secondary);

      &.primary {
        background: var(--color-bg-primary);
      }
    }
  }

  .body ~ .footer {
    padding-top: 0;
  }
}
</style>
