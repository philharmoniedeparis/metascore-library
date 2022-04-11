<i18n>
{
  "en": {
    "apply_button": "Appliquer",
    "cancel_button": "Cancel",
  },
  "fr": {
    "apply_button": "Appliquer",
    "cancel_button": "Annuler",
  },
}
</i18n>

<template>
  <form-group
    :class="['control', 'border-radius', { readonly, disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <text-control
      ref="opener"
      class="opener"
      :autofocus="autofocus"
      :readonly="true"
      :disabled="disabled"
      :model-value="modelValue"
      @click="onOpenerClick"
    />

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>

    <div
      v-if="showOverlay"
      ref="overlay"
      class="overlay"
      tabindex="-1"
      :style="overlayStyle"
      @blur="onOverlayBlur"
      @mousedown.prevent
    >
      <div class="shape">
        <template v-if="values">
          <template v-for="prop in props" :key="prop">
            <number-control
              v-model="values[prop].x"
              class="prop-control"
              :min="0"
              :data-prop="prop"
              data-axis="x"
            />
            <number-control
              v-model="values[prop].y"
              class="prop-control"
              :min="0"
              :data-prop="prop"
              data-axis="y"
            />
          </template>
        </template>

        <div ref="preview" class="preview" :style="previewStyle">
          <template v-if="values">
            <div
              class="resize-handle"
              data-prop="top-left"
              data-axis="x"
              :style="{ left: `${values['top-left'].x}px`, top: 0 }"
            ></div>
            <div
              class="resize-handle"
              data-prop="top-left"
              data-axis="y"
              :style="{ left: 0, top: `${values['top-left'].y}px` }"
            ></div>
            <div
              class="resize-handle"
              data-prop="top-right"
              data-axis="x"
              data-reversed
              :style="{ right: `${values['top-right'].x}px`, top: 0 }"
            ></div>
            <div
              class="resize-handle"
              data-prop="top-right"
              data-axis="y"
              :style="{ right: 0, top: `${values['top-right'].y}px` }"
            ></div>
            <div
              class="resize-handle"
              data-prop="bottom-left"
              data-axis="x"
              :style="{ left: `${values['bottom-left'].x}px`, bottom: 0 }"
            ></div>
            <div
              class="resize-handle"
              data-prop="bottom-left"
              data-axis="y"
              data-reversed
              :style="{ left: 0, bottom: `${values['bottom-left'].y}px` }"
            ></div>
            <div
              class="resize-handle"
              data-prop="bottom-right"
              data-axis="x"
              data-reversed
              :style="{
                right: `${values['bottom-right'].x}px`,
                bottom: 0,
              }"
            ></div>
            <div
              class="resize-handle"
              data-prop="bottom-right"
              data-axis="y"
              data-reversed
              :style="{
                right: 0,
                bottom: `${values['bottom-right'].y}px`,
              }"
            ></div>
          </template>
        </div>
      </div>

      <div class="buttons">
        <styled-button class="apply" role="primary" @click="onApplyClick">
          {{ $t("apply_button") }}
        </styled-button>
        <styled-button class="cancel" role="secondary" @click="onCancelClick">
          {{ $t("cancel_button") }}
        </styled-button>
      </div>
    </div>
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
      values: null,
    };
  },
  computed: {
    previewStyle() {
      let borderRadius = null;

      if (!this.values) {
        borderRadius = this.modelValue;
      } else {
        const x = [];
        const y = [];
        this.props.forEach((prop) => {
          x.push(prop in this.values ? `${this.values[prop].x}px` : 0);
          y.push(prop in this.values ? `${this.values[prop].y}px` : 0);
        });

        borderRadius = `${x.join(" ")} / ${y.join(" ")}`;
      }

      return { borderRadius };
    },
  },
  watch: {
    showOverlay(value) {
      if (value) {
        this.$nextTick(function () {
          this.parseValue();
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
      } else {
        if (this.overlayUpdateCleanup) {
          this.overlayUpdateCleanup();
          this.overlayUpdateCleanup = null;
        }
        this.values = null;
      }
    },
  },
  mounted() {
    this.$nextTick(function () {
      this._interactable = interact(".resize-handle").draggable({
        context: this.$el,
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
  },
  methods: {
    parseValue() {
      const preview = this.$refs.preview;
      this.values = {};

      this.props.forEach((prop) => {
        const css = preview.style.getPropertyValue(`border-${prop}-radius`);
        if (css !== null) {
          const matches = css.match(/(\d*)px/g);
          if (matches) {
            this.values[prop] = {
              x: parseInt(matches[0], 10),
              y: parseInt(matches[matches.length > 1 ? 1 : 0], 10),
            };
          }
        }
      });
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
    onOverlayBlur() {
      this.showOverlay = false;
    },
    onHandleDraggableMove(evt) {
      const { target: handle, dx, dy } = evt;
      const prop = handle.dataset.prop;
      const axis = handle.dataset.axis;
      const reversed = "reversed" in handle.dataset;
      const delta = axis === "x" ? dx : dy;

      this.values[prop][axis] += delta * (reversed ? -1 : 1);
    },
    onApplyClick() {
      const preview = this.$refs.preview;
      this.$emit(
        "update:modelValue",
        preview.style.getPropertyValue("border-radius")
      );
      this.showOverlay = false;
    },
    onCancelClick() {
      this.showOverlay = false;
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
    background: $lightgray;
    border: 1px solid $mediumgray;
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
      background: $mediumgray;
      border: 1px solid $white;
      box-sizing: border-box;

      .resize-handle {
        position: absolute;
        width: 0.75em;
        height: 0.75em;
        margin: -0.35em;
        background: $white;
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
        background: $darkgray;

        &.secondary {
          background: $mediumgray;
        }
      }
    }
  }

  &.disabled {
    .opener {
      opacity: 0.5;
      cursor: default;
    }
  }
}
</style>
