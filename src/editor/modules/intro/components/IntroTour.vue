<i18n>
  {
    "fr": {
      "close_title": "Fermer",
      "dont_show_again": "Ne plus afficher",
      "loading": "Chargement ...",
      "error": "Une erreur s’est produite. Veuillez réessayer plus tard.",
      "buttons": {
        "prev": "Précédent",
        "next": "Suivant",
        "close": "Terminé"
      }
    },
    "en": {
      "close_title": "Close",
      "dont_show_again": "Don't show again",
      "loading": "Loading...",
      "error": "An error occurred. Please try again later.",
      "buttons": {
        "prev": "Previous",
        "next": "Next",
        "close": "Done"
      }
    }
  }
</i18n>

<template>
  <div class="intro-tour">
    <element-highlighter
      :rect="refRect"
      :teleport-target="null"
      :allow-interaction="currentStep?.allowInteraction"
      :overlay-opacity="configs.overlayOpacity"
      @click="onHighlighterClick"
    />

    <template v-if="currentStep">
      <div ref="ref" class="intro-tour--ref" :style="refStyle"></div>

      <div ref="tooltip" class="intro-tour--tooltip" :style="tooltipStyle">
        <div
          v-show="tooltipArrowStyle"
          ref="tooltip-arrow"
          class="intro-tour--tooltip--arrow"
          :style="tooltipArrowStyle"
        ></div>
        <div class="intro-tour--tooltip--content">
          <div class="intro-tour--tooltip--header">
            <h3 class="title">{{ currentStep.title }}</h3>
            <base-button
              v-tooltip
              class="close"
              :title="$t('close_title')"
              :aria-label="$t('close_title')"
              @click="onCloseClick"
            >
              <template #icon><close-icon /></template>
            </base-button>
          </div>
          <div class="intro-tour--tooltip--body">
            <template v-if="error">{{ $t("error") }}</template>
            <template v-else-if="processing">{{ $t("loading") }}</template>
            <template v-else>
              <div
                v-if="currentStep.text"
                v-dompurify-html="currentStep.text"
                class="intro-tour--text"
              ></div>

              <checkbox-control
                v-if="configs.dontShowAgainUrl"
                v-model="dontShowAgain"
                class="intro-tour--dontshowagain"
                :label="$t('dont_show_again')"
              />

              <dot-navigation
                v-if="configs.bullets"
                v-model="currentStepIndex"
                class="intro-tour--bullets"
                :items-count="stepCount"
              />
            </template>
          </div>

          <progress
            v-if="configs.progress"
            class="intro-tour--progress"
            :max="stepCount"
            :value="currentStepIndex + 1"
          ></progress>

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
    </template>
  </div>
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
import CloseIcon from "../assets/icons/close.svg?component";

export default {
  components: {
    CloseIcon,
  },
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective({
      hooks: {
        afterSanitizeAttributes: (node) => {
          if (node.tagName === "A" && node.hasAttribute("href")) {
            node.setAttribute("target", "_blank");
          }
        },
      },
    }),
  },
  props: {
    context: {
      type: HTMLElement,
      default: document,
    },
  },
  emits: ["close"],
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      processing: false,
      error: null,
      refRect: null,
      refStyle: null,
      tooltipStyle: null,
      tooltipArrowStyle: null,
      currentStepIndex: -1,
      dontShowAgain: false,
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
  },
  watch: {
    processing() {
      this.updateRefStyle();
      this.updateTooltipStyle();
    },
    async refStyle() {
      await this.$nextTick();
      this.refRect = this.$refs.ref.getBoundingClientRect();
    },
    async currentStepIndex(value, oldValue) {
      try {
        await this.processSteps(value, oldValue);
      } catch (error) {
        this.error = error;
        console.error(error);
      }
    },
  },
  created() {
    this.onWindowResize = debounce(() => {
      this.updateRefStyle();
    }, 50 /* Needs to be less than ElementHighlighter's */);
  },
  async mounted() {
    await this.$nextTick();

    this.currentStepIndex = 0;

    window.addEventListener("resize", this.onWindowResize);
    window.addEventListener("keydown", this.onKeyDown, true);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("keydown", this.onKeyDown, true);
  },
  methods: {
    getElement(el) {
      if (typeof el === "object") {
        return el;
      }

      if (typeof el === "string") {
        return this.context.querySelector(el);
      }

      return null;
    },
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
    async close() {
      if (this.dontShowAgain) {
        try {
          await this.store.setDontShowAgain();
        } catch (e) {
          // @todo: handle.
          console.error(e);
        }
      }
      this.$emit("close");
    },
    async processSteps(index, oldIndex) {
      this.processing = true;

      let reverse = false;
      if (oldIndex && oldIndex > index) {
        reverse = true;
      }

      const steps = [];

      if (reverse) {
        // Add backward steps.
        for (let i = oldIndex; i > index; i--) {
          const step = this.steps.at(i);
          const backwardSteps = step["backward"];
          if (backwardSteps) {
            for (let i = 0; i < backwardSteps.length; i++) {
              steps.push(backwardSteps.at(i));
            }
          }
        }
      } else {
        // Add forward steps.
        for (let i = oldIndex + 1; i <= index; i++) {
          const step = this.steps.at(i);
          const forwardSteps = step["forward"];
          if (forwardSteps) {
            for (let i = 0; i < forwardSteps.length; i++) {
              steps.push(forwardSteps.at(i));
            }
          }
        }
      }

      // Add current step.
      steps.push(this.steps.at(index));

      for (let i = 0; i < steps.length; i++) {
        await this.processStep(steps.at(i));
      }

      this.processing = false;
    },
    async processStep(step) {
      switch (step.type) {
        case "interactive":
          await this.processInteractiveStep(step);
          break;

        case "wait":
          await this.processWaitStep(step);
          break;
      }
    },
    processInteractiveStep(step) {
      const { element, event } = step;
      const stepEl = this.getElement(element);

      switch (event) {
        case "click":
          if (stepEl) {
            const event = new MouseEvent("click", {
              ...(step.modifiers ?? {}),
            });
            stepEl.dispatchEvent(event);
          }
          break;
      }
    },
    async processWaitStep(step, _time = Date.now()) {
      const { element, timeout } = step;

      if (!this.getElement(element)) {
        if (timeout && timeout < Date.now() - _time) {
          throw new Error("Wait step timed out.");
        }

        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        }).then(() => {
          return this.processWaitStep(step, _time);
        });
      }
    },
    updateRefStyle() {
      if (!this.currentStep) return;

      const stepEl = this.processing
        ? null
        : this.getElement(this.currentStep.element);

      if (stepEl) {
        const rect = stepEl.getBoundingClientRect();
        const offset = this.$el.getBoundingClientRect();

        this.refStyle = {
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          top: `${rect.top - offset.top}px`,
          left: `${rect.left - offset.left}px`,
        };
        return;
      }

      this.refStyle = {
        width: "0px",
        height: "0px",
        top: "50%",
        left: "50%",
      };
    },
    async updateTooltipStyle() {
      if (!this.currentStep) return;

      if (this.processing || !this.currentStep.element) {
        this.tooltipStyle = null;
        this.tooltipArrowStyle = null;
        return;
      }

      const options = {
        strategy: "fixed",
        middleware: [],
      };

      if (this.currentStep.position) {
        if (this.currentStep.position === "center") {
          options.middleware.push(
            offset(
              ({ rects }) =>
                -rects.reference.height / 2 - rects.floating.height / 2
            )
          );
        } else {
          options.middleware.push(offset(20), shift({ padding: 10 }));
          options.placement = this.currentStep.position;
        }
      } else {
        options.middleware.push(autoPlacement());
      }

      // This needs to be after autoPlacement.
      options.middleware.push(arrow({ element: this.$refs["tooltip-arrow"] }));

      const { x, y, placement, middlewareData } = await computePosition(
        this.$refs.ref,
        this.$refs.tooltip,
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
      border: 2px solid var(--metascore-color-white);
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
  box-shadow: 0 0 0.5em 0 var(--metascore-color-black);
  transition: all 0.3s ease-out;
  pointer-events: auto;
  z-index: 999999;
}

.intro-tour--tooltip--arrow {
  position: absolute;
  width: 1em;
  height: 1em;
  transition: all 0.3s ease-out;
  transform: rotate(45deg);
  background-color: var(--metascore-color-bg-primary);
  box-shadow: 0 0 0.5em 0 var(--metascore-color-black);
  z-index: -1;
}

.intro-tour--tooltip--content {
  background: var(--metascore-color-bg-primary);
  border: 2px solid var(--metascore-color-bg-primary);
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
  background: var(--metascore-color-bg-tertiary);
  color: var(--metascore-color-white);

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

.intro-tour--text {
  :deep(a) {
    color: inherit;
    text-decoration: underline;

    &:hover,
    &:active {
      text-decoration: none;
    }
  }
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
  color: var(--metascore-color-white);
  background-color: var(--metascore-color-bg-secondary);
  border: none;

  &::-webkit-progress-value {
    background-color: var(--metascore-color-white);
  }
  &::-moz-progress-bar {
    background-color: var(--metascore-color-white);
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
    background: var(--metascore-color-bg-secondary);

    &.primary {
      background: var(--metascore-color-bg-tertiary);
    }
  }
}
</style>
