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
    <floating-vue
      strategy="fixed"
      placement="bottom"
      popper-class="overlay"
      :triggers="['click']"
      :disabled="readonly || disabled"
      :delay="0"
      :container="false"
      :handle-resize="false"
      @apply-show="onOverlayApplyShow"
    >
      <text-control
        :autofocus="autofocus"
        :readonly="true"
        :disabled="disabled"
        :model-value="modelValue"
        class="opener"
      />

      <template #popper="{ hide }">
        <div ref="shape" class="shape" :style="{ borderRadius: modelValue }">
          <div
            class="resize-handle"
            data-prop="top-left"
            data-axis="x"
            :style="{ left: `${parsedValue['top-left'][0]}px`, top: 0 }"
          ></div>
          <div
            class="resize-handle"
            data-prop="top-left"
            data-axis="y"
            :style="{ left: 0, top: `${parsedValue['top-left'][1]}px` }"
          ></div>
          <div
            class="resize-handle"
            data-prop="top-right"
            data-axis="x"
            :style="{ right: `${parsedValue['top-right'][0]}px`, top: 0 }"
          ></div>
          <div
            class="resize-handle"
            data-prop="top-right"
            data-axis="y"
            :style="{ right: 0, top: `${parsedValue['top-right'][1]}px` }"
          ></div>
          <div
            class="resize-handle"
            data-prop="bottom-left"
            data-axis="x"
            :style="{ left: `${parsedValue['bottom-left'][0]}px`, bottom: 0 }"
          ></div>
          <div
            class="resize-handle"
            data-prop="bottom-left"
            data-axis="y"
            :style="{ left: 0, bottom: `${parsedValue['bottom-left'][1]}px` }"
          ></div>
          <div
            class="resize-handle"
            data-prop="bottom-right"
            data-axis="x"
            :style="{ right: `${parsedValue['bottom-right'][0]}px`, bottom: 0 }"
          ></div>
          <div
            class="resize-handle"
            data-prop="bottom-right"
            data-axis="y"
            :style="{ right: 0, bottom: `${parsedValue['bottom-right'][1]}px` }"
          ></div>
        </div>

        <div class="buttons">
          <styled-button
            class="apply"
            role="primary"
            @click="onApplyClick(hide)"
          >
            {{ $t("apply_button") }}
          </styled-button>
          <styled-button class="cancel" role="secondary" @click="hide">
            {{ $t("cancel_button") }}
          </styled-button>
        </div>
      </template>
    </floating-vue>

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import { Dropdown as FloatingVue } from "floating-vue";
import "@metascore-library/editor/scss/_floating-vue.scss";

export default {
  components: {
    FloatingVue,
  },
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
      internalValue: null,
      overlayOpen: false,
      parsedValue: {
        "top-left": [0, 0],
        "top-right": [0, 0],
        "bottom-left": [0, 0],
        "bottom-right": [0, 0],
      },
    };
  },
  watch: {
    modelValue(value) {
      this.internalValue = value;
    },
    internalValue() {
      if (!this.overlayOpen) {
        return;
      }

      this.parseValue();
    },
    overlayOpen(value) {
      if (value) {
        this.parseValue();
      }
    },
  },
  mounted() {
    this.internalValue = this.modelValue;

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
      const shape = this.$refs.shape;

      Object.keys(this.parsedValue).forEach((prop) => {
        const value = [0, 0];
        const css = shape.style.getPropertyValue(`border-${prop}-radius`);

        if (css !== null) {
          const matches = css.match(/(\d*)px/g);

          if (matches) {
            if (matches.length > 1) {
              value[0] = parseInt(matches[0], 10);
              value[1] = parseInt(matches[1], 10);
            } else {
              value[0] = value[1] = parseInt(matches[0], 10);
            }
          }
        }

        this.parsedValue[prop] = value;
      });
    },
    onOverlayApplyShow() {
      this.overlayOpen = true;
    },
    onHandleDraggableMove(evt) {
      const { target: handle, dx, dy } = evt;
      const prop = handle.dataset.prop;
      const axis = handle.dataset.axis;

      switch (axis) {
        case "x":
          this.parsedValue[prop][0] += dx;
          break;
        case "y":
          this.parsedValue[prop][1] += dy;
          break;
      }
    },
    onApplyClick(hide) {
      this.$emit("update:modelValue", this.internalValue);
      hide();
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  ::v-deep(.overlay) {
    background: $lightgray;
    border: 1px solid $mediumgray;
    box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.5);

    .shape {
      position: relative;
      margin: 2em;
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
        color: $white;
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
