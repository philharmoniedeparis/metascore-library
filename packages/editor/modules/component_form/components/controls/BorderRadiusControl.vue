<i18n>
{
  "fr": {
    "apply_button": "Appliquer",
    "clear_button": "Effacer",
    "cancel_button": "Annuler",
  },
  "en": {
    "apply_button": "Apply",
    "clear_button": "Clear",
    "cancel_button": "Cancel",
  },
}
</i18n>

<template>
  <form-group :class="[
    'control',
    'border-radius',
    { readonly, disabled, empty: !modelValue },
  ]" :label="label" :label-for="inputId" :description="description" :required="required">
    <text-control ref="opener" v-model="value" class="opener" :autofocus="autofocus" :readonly="readonly"
      :disabled="disabled" @click="onOpenerClick" />

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>

    <div v-if="showOverlay" ref="overlay" class="overlay" tabindex="-1" :style="overlayStyle">
      <div class="shape">
        <template v-for="(subvalue, key) in internalValue" :key="key">
          <number-control v-model="subvalue.x" class="prop-control" :min="0" :data-prop="key" data-axis="x" />
          <number-control v-model="subvalue.y" class="prop-control" :min="0" :data-prop="key" data-axis="y" />
        </template>

        <div ref="preview" class="preview" :style="previewStyle">
          <div class="resize-handle" data-prop="top-left" data-axis="x"
            :style="{ left: `${internalValue['top-left'].x}px`, top: 0 }"></div>
          <div class="resize-handle" data-prop="top-left" data-axis="y"
            :style="{ left: 0, top: `${internalValue['top-left'].y}px` }"></div>
          <div class="resize-handle" data-prop="top-right" data-axis="x" data-reversed
            :style="{ right: `${internalValue['top-right'].x}px`, top: 0 }"></div>
          <div class="resize-handle" data-prop="top-right" data-axis="y"
            :style="{ right: 0, top: `${internalValue['top-right'].y}px` }"></div>
          <div class="resize-handle" data-prop="bottom-left" data-axis="x"
            :style="{ left: `${internalValue['bottom-left'].x}px`, bottom: 0 }"></div>
          <div class="resize-handle" data-prop="bottom-left" data-axis="y" data-reversed
            :style="{ left: 0, bottom: `${internalValue['bottom-left'].y}px` }"></div>
          <div class="resize-handle" data-prop="bottom-right" data-axis="x" data-reversed :style="{
            right: `${internalValue['bottom-right'].x}px`,
            bottom: 0,
          }"></div>
          <div class="resize-handle" data-prop="bottom-right" data-axis="y" data-reversed :style="{
            right: 0,
            bottom: `${internalValue['bottom-right'].y}px`,
          }"></div>
        </div>
      </div>

      <div class="buttons">
        <base-button class="apply" role="primary" @click="onApplyClick">
          {{ $t("apply_button") }}
        </base-button>
        <base-button v-if="!required" class="clear" role="secondary" @click="onClearClick">
          {{ $t("clear_button") }}
        </base-button>
        <base-button class="cancel" role="secondary" @click="onCancelClick">
          {{ $t("cancel_button") }}
        </base-button>
      </div>
    </div>

    <div ref="parser" class="parser"></div>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import {
  computePosition,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/dom";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";

export default {
  props: {
    label: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      inputId: uuid(),
      showOverlay: false,
      overlayStyle: null,
      overlayUpdateCleanup: null,
      props: ["top-left", "top-right", "bottom-right", "bottom-left"],
      internalValue: null,
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        if (!this.lazy) {
          this.$emit("update:modelValue", value);
        }
      },
    },
    previewStyle() {
      let borderRadius = null;

      const x = [];
      const y = [];
      Object.values(this.internalValue).forEach((value) => {
        x.push(`${value.x}px`);
        y.push(`${value.y}px`);
      });

      borderRadius = `${x.join(" ")} / ${y.join(" ")}`;

      return { borderRadius };
    },
  },
  watch: {
    showOverlay(value) {
      if (value) {
        this.internalValue = this.parseCSS(this.modelValue);

        this.$nextTick(function () {
          this.$refs.overlay.focus();
          this.updateOverlayStyle();
          this.overlayUpdateCleanup = autoUpdate(
            this.$refs.opener,
            this.$refs.overlay,
            this.updateOverlayStyle,
            {
              elementResize: false,
            }
          );
        });

        this.$el.ownerDocument.addEventListener(
          "focusin",
          this.onDocumentFocusin
        );
      } else if (this.overlayUpdateCleanup) {
        this.overlayUpdateCleanup();
        this.overlayUpdateCleanup = null;

        this.$el.ownerDocument.removeEventListener(
          "focusin",
          this.onDocumentFocusin
        );
      }
    },
  },
  mounted() {
    this.$nextTick(function () {
      this._interactable = interact(".resize-handle", {
        context: this.$el,
      }).draggable({
        modifiers: [
          interact.modifiers.restrict({
            restriction: "parent",
          }),
        ],
        listeners: {
          move: this.onHandleDraggableMove,
        },
      });
    });
  },
  beforeUnmount() {
    if (this._interactable) {
      this._interactable.unset();
      delete this._interactable;
    }

    this.$el.ownerDocument.removeEventListener(
      "focusin",
      this.onDocumentFocusin
    );
  },
  methods: {
    parseCSS(css) {
      this.$refs.parser.style.borderRadius = css;

      return this.props.reduce((acc, prop) => {
        const prop_css = this.$refs.parser.style.getPropertyValue(
          `border-${prop}-radius`
        );
        const matches = prop_css ? prop_css.match(/(\d*)px/g) : false;
        acc[prop] = {
          x: matches ? parseInt(matches[0], 10) : 0,
          y: matches ? parseInt(matches[matches.length > 1 ? 1 : 0], 10) : 0,
        };
        return acc;
      }, {});
    },
    async updateOverlayStyle() {
      const { x, y } = await computePosition(
        this.$refs.opener.$el,
        this.$refs.overlay,
        {
          strategy: "fixed",
          placement: "bottom",
          middleware: [offset(10), flip(), shift({ padding: 10 })],
        }
      );

      this.overlayStyle = {
        left: `${x}px`,
        top: `${y}px`,
      };
    },
    onOpenerClick() {
      this.showOverlay = true;
    },
    onHandleDraggableMove(evt) {
      const { target: handle, dx, dy } = evt;
      const prop = handle.dataset.prop;
      const axis = handle.dataset.axis;
      const reversed = "reversed" in handle.dataset;
      const delta = axis === "x" ? dx : dy;

      this.internalValue[prop][axis] += delta * (reversed ? -1 : 1);
    },
    onApplyClick() {
      const preview = this.$refs.preview;
      this.$emit(
        "update:modelValue",
        preview.style.getPropertyValue("border-radius")
      );
      this.showOverlay = false;
    },
    onClearClick() {
      this.showOverlay = false;
      this.$emit("update:modelValue", null);
    },
    onCancelClick() {
      this.showOverlay = false;
    },
    onDocumentFocusin(evt) {
      if (!this.$refs.overlay.contains(evt.target)) {
        this.showOverlay = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  position: relative;

  .overlay {
    position: fixed;
    width: 20em;
    background: var(--metascore-color-bg-primary);
    border: 1px solid var(--metascore-color-bg-secondary);
    box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.5);
    z-index: 9999;

    .shape {
      display: grid;
      grid-auto-columns: 1fr;
      grid-template-columns: 3em 3em 1fr 3em 3em;
      grid-template-rows: min-content min-content 1fr min-content min-content;
      grid-template-areas:
        ". top-left-x . top-right-x ."
        "top-left-y preview preview preview top-right-y"
        ". preview preview preview ."
        "bottom-left-y preview preview preview bottom-right-y"
        ". bottom-left-x . bottom-right-x .";
      margin: 1em;
    }

    .prop-control {
      &[data-prop="top-left"][data-axis="x"] {
        grid-area: top-left-x;
        align-self: flex-start;
      }

      &[data-prop="top-left"][data-axis="y"] {
        grid-area: top-left-y;
        align-self: flex-start;
      }

      &[data-prop="top-right"][data-axis="x"] {
        grid-area: top-right-x;
        align-self: flex-start;
      }

      &[data-prop="top-right"][data-axis="y"] {
        grid-area: top-right-y;
        align-self: flex-start;
      }

      &[data-prop="bottom-left"][data-axis="x"] {
        grid-area: bottom-left-x;
        align-self: flex-end;
      }

      &[data-prop="bottom-left"][data-axis="y"] {
        grid-area: bottom-left-y;
        align-self: flex-end;
      }

      &[data-prop="bottom-right"][data-axis="x"] {
        grid-area: bottom-right-x;
        align-self: flex-end;
      }

      &[data-prop="bottom-right"][data-axis="y"] {
        grid-area: bottom-right-y;
        align-self: flex-end;
      }
    }

    .preview {
      position: relative;
      grid-area: preview;
      margin: 1em;
      background: var(--metascore-color-bg-secondary);
      border: 1px solid var(--metascore-color-white);
      box-sizing: border-box;

      .resize-handle {
        position: absolute;
        width: 0.75em;
        height: 0.75em;
        margin: -0.35em;
        background: var(--metascore-color-white);
        box-sizing: border-box;
        opacity: 0.5;
        z-index: 2;

        &.top {
          top: 0;
        }

        &.right {
          left: 100%;
        }

        &.bottom {
          top: 100%;
        }

        &.left {
          left: 0;
        }

        &:hover {
          opacity: 1;
        }
      }

      &:after {
        content: "";
        display: block;
        padding-bottom: 100%;
      }
    }

    .buttons {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      margin: 0.5em 0.75em;
      gap: 0.5em;

      button {
        padding: 0.5em;
        background: var(--metascore-color-bg-tertiary);

        &.secondary {
          background: var(--metascore-color-bg-secondary);
        }
      }
    }
  }

  .parser {
    display: none;
  }

  &.disabled {
    .opener {
      opacity: 0.5;
      cursor: default;
    }
  }
}
</style>
