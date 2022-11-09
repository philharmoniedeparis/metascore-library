<i18n>
  {
    "fr": {
      "close_title": "Fermer",
      "dont_show_again": "Ne plus afficher",
      "buttons": {
        "prev": "Retour",
        "next": "Suivant",
        "close": "Terminé",
      }
    },
    "en": {
      "close_title": "Close",
      "dont_show_again": "Don't show again",
      "buttons": {
        "prev": "Back",
        "next": "Next",
        "close": "Done",
      }
    },
  }
  </i18n>

<template>
  <Transition name="fade">
    <div v-if="stepCount > 0 && !closed" class="intro-tour">
      <element-highlighter
        :rect="refRect"
        :teleport-target="null"
        :allow-interaction="currentStep.allowInteraction"
        :overlay-opacity="configs.overlayOpacity"
        @click="onHighlighterClick"
      />
      <div ref="ref" class="intro-tour--ref" :style="refStyle" />

      <div ref="tooltip" class="intro-tour--tooltip" :style="tooltipStyle">
        <div
          ref="tooltip-arrow"
          class="intro-tour--tooltip--arrow"
          :style="tooltipArrowStyle"
        ></div>
        <div class="intro-tour--tooltip--content">
          <div class="intro-tour--tooltip--header">
            <h3 class="title">{{ currentStep.title }}</h3>
            <base-button
              class="close"
              :title="$t('close_title')"
              :aria-label="$t('close_title')"
              @click="onCloseClick"
            >
              <template #icon><close-icon /></template>
            </base-button>
          </div>
          <div class="intro-tour--tooltip--body">
            <div
              v-if="currentStep.text"
              v-dompurify-html="currentStep.text"
              class="intro-tour--text"
            />

            <checkbox-control
              v-if="configs.dontShowAgainUrl"
              v-model="dontShowAgain"
              class="intro-tour--dontshowagain"
              :label="$t('dont_show_again')"
            ></checkbox-control>

            <dot-navigation
              v-if="configs.bullets"
              v-model="currentStepIndex"
              class="intro-tour--bullets"
              :items-count="stepCount"
            />
          </div>

          <progress
            v-if="configs.progress"
            class="intro-tour--progress"
            :max="stepCount"
            :value="currentStepIndex + 1"
          />

          <div class="intro-tour--tooltip--footer">
            <base-button
              class="prev"
              :disabled="isFirstStep"
              @click="onPrevClick"
            >
              {{ $t("buttons.prev") }}
            </base-button>
            <base-button
              v-if="isLastStep"
              type="button"
              role="primary"
              @click="onCloseClick"
            >
              {{ $t("buttons.close") }}
            </base-button>
            <base-button
              v-else
              type="button"
              role="primary"
              @click="onNextClick"
            >
              {{ $t("buttons.next") }}
            </base-button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import {
  computePosition,
  offset,
  shift,
  arrow,
  autoPlacement,
} from "@floating-ui/dom";
import { debounce } from "lodash";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import useStore from "../store";
import CloseIcon from "../assets/icons/close.svg?inline";

export default {
  components: {
    CloseIcon,
  },
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  emits: ["close"],
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      ref: null,
      refRect: null,
      refStyle: null,
      tooltip: null,
      tooltipStyle: null,
      tooltipArrowStyle: null,
      currentStepIndex: 0,
      dontShowAgain: false,
      closed: false,
    };
  },
  computed: {
    configs() {
      return this.store.configs;
    },
    steps() {
      return this.configs.steps;
    },
    stepCount() {
      return this.steps.length;
    },
    currentStep() {
      return this.steps[this.currentStepIndex];
    },
    isFirstStep() {
      return this.currentStepIndex === 0;
    },
    isLastStep() {
      return this.currentStepIndex === this.stepCount - 1;
    },
    currentStepEl() {
      const el = this.currentStep.element;

      if (el) {
        if (typeof el === "object") {
          return el;
        } else if (typeof el === "string") {
          // @todo: use a context element.
          return document.querySelector(el);
        }
      }

      return null;
    },
  },
  watch: {
    ref() {
      this.updateRefStyle();
    },
    refStyle() {
      this.updateTooltipStyle();
      this.$nextTick(function () {
        this.refRect = this.ref.getBoundingClientRect();
      });
    },
    currentStep() {
      this.updateRefStyle();
    },
  },
  created() {
    this.onWindowResize = debounce(() => {
      this.updateRefStyle();
    }, 50 /* Needs to be less than ElementHighlighter's */);
  },
  mounted() {
    this.$nextTick(function () {
      this.ref = this.$refs.ref;
      this.tooltip = this.$refs.tooltip;

      window.addEventListener("resize", this.onWindowResize);
      window.addEventListener("keydown", this.onKeyDown, true);
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  },
  methods: {
    onHighlighterClick() {
      if (this.configs.exitOnOverlyClick) {
        this.close();
      }
    },
    onPrevClick() {
      this.goto(this.currentStepIndex - 1);
    },
    onNextClick() {
      this.goto(this.currentStepIndex + 1);
    },
    onCloseClick() {
      this.close();
    },
    onKeyDown(evt) {
      if (evt.repeat) return;

      if (evt.key === "Escape" && this.configs.exitOnEsc) {
        this.close();
        return;
      }

      if (this.configs.keyboardNavigation) {
        switch (evt.key) {
          case "ArrowLeft":
            this.goto(this.currentStepIndex - 1);
            break;

          case "ArrowRight":
            this.goto(this.currentStepIndex + 1);
            break;
        }
      }
    },
    goto(index) {
      this.currentStepIndex = Math.min(this.stepCount - 1, Math.max(0, index));
    },
    close() {
      if (this.dontShowAgain) {
        this.store.setDontShowAgain();
      }
      this.closed = true;
      this.$emit("close");
    },
    updateRefStyle() {
      if (!this.ref) return;

      if (this.currentStepEl) {
        const rect = this.currentStepEl.getBoundingClientRect();
        const offset = this.$el.getBoundingClientRect();

        this.refStyle = {
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          top: `${rect.top - offset.top}px`,
          left: `${rect.left - offset.left}px`,
        };
      } else {
        this.refStyle = {
          width: "0px",
          height: "0px",
          top: "50%",
          left: "50%",
        };
      }
    },
    async updateTooltipStyle() {
      if (!this.ref || !this.tooltip) return;

      if (!this.currentStep.element) {
        this.tooltipStyle = null;
        this.tooltipArrowStyle = {
          display: "none",
        };
        return;
      }

      const options = {
        strategy: "fixed",
        middleware: [
          offset(20),
          shift({ padding: 10 }),
          arrow({ element: this.$refs["tooltip-arrow"] }),
        ],
      };

      if (this.currentStep.position) {
        options.placement = this.currentStep.position;
      } else {
        options.middleware.push(autoPlacement());
      }

      const { x, y, placement, middlewareData } = await computePosition(
        this.ref,
        this.tooltip,
        options
      );

      this.tooltipStyle = {
        left: `${x}px`,
        top: `${y}px`,
        transform: "none",
      };

      if (middlewareData.arrow) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        const staticSide = {
          top: "bottom",
          right: "left",
          bottom: "top",
          left: "right",
        }[placement.split("-")[0]];

        this.tooltipArrowStyle = {
          left: arrowX ? `${arrowX}px` : null,
          top: arrowY ? `${arrowY}px` : null,
          [staticSide]: "-0.5em",
        };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.intro-tour {
  position: absolute;
  inset: 0;
  pointer-events: none;

  :deep(.element-highlighter) {
    .highlight {
      border: 2px solid $white;
    }
  }
}

.intro-tour--ref {
  position: absolute;
}

.intro-tour--tooltip {
  position: absolute;
  left: 50%;
  top: 50%;
  min-width: 15em;
  max-width: 30em;
  transform: translateX(-50%) translateY(-50%);
  box-shadow: 0 0 0.5em 0 $black;
  transition: all 0.3s ease-out;
  pointer-events: auto;
  z-index: 999999;
}

.intro-tour--tooltip--arrow {
  position: absolute;
  width: 1em;
  height: 1em;
  transition: transform 0.2s ease 0s;
  transform: rotate(45deg);
  background-color: $lightgray;
  z-index: -1;
}

.intro-tour--tooltip--content {
  background: $lightgray;
  border: 2px solid $lightgray;
  border-radius: 0.25em;
  overflow: hidden;
  box-sizing: border-box;
}

.intro-tour--tooltip--header {
  display: flex;
  margin: 0;
  padding: 0.5em;
  justify-content: space-between;
  align-items: center;
  background: $darkgray;
  color: $white;

  .title {
    margin: 0;
    font-size: 1em;
    font-weight: 600;
  }

  :deep(.base-button) {
    font-size: 0.75em;
  }
}

.intro-tour--tooltip--body {
  display: flex;
  flex-direction: column;
  padding: 1em;
}

.intro-tour--dontshowagain {
  margin: 0;
  font-size: 0.95em;
  opacity: 0.75;
}

.intro-tour--progress {
  display: block;
  width: 100%;
  height: 1px;
  margin-bottom: 1em;
  color: $white;
  background-color: $mediumgray;
  border: none;

  &::-webkit-progress-value {
    background-color: $white;
  }
  &::-moz-progress-bar {
    background-color: $white;
  }
}

.intro-tour--tooltip--footer {
  display: flex;
  padding: 1em;
  padding-top: 0;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 1em;

  :deep(.base-button) {
    padding: 0.5em 1em;
    background: $mediumgray;

    &.primary {
      background: $darkgray;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
