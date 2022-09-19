<template>
  <form-group
    :class="['control', 'time', { readonly, disabled }]"
    :label="label"
    :label-for="inputId"
    :description="description"
    :required="required"
  >
    <div
      class="input-container"
      @focusin="onInputFocus"
      @focusout="onInputBlur"
    >
      <!-- eslint-disable vue/no-deprecated-html-element-is -->
      <input
        is="timecode-input"
        :id="inputId"
        v-model="value"
        v-autofocus="autofocus"
        :required="required"
        :readonly="readonly"
        :disabled="disabled"
        :min="min"
        :max="max"
        @change="onInputChange"
      />
      <!-- eslint-enable vue/no-deprecated-html-element-is -->
      <div
        v-if="!disabled && (inButton || outButton || clearButton)"
        class="buttons"
      >
        <base-button
          v-if="inButton && !readonly"
          type="button"
          class="in"
          @click="onInClick"
        >
          <template #icon><in-icon /></template>
        </base-button>
        <base-button
          v-if="outButton"
          type="button"
          class="out"
          @click="onOutClick"
        >
          <template #icon><out-icon /></template>
        </base-button>
        <base-button
          v-if="clearButton && !readonly"
          type="button"
          class="clear"
          @click="onClearClick"
        >
          <template #icon><clear-icon /></template>
        </base-button>
      </div>
    </div>

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import { round } from "lodash";
import "timecode-input";
import { useModule } from "@metascore-library/core/services/module-manager";
import ClearIcon from "../assets/icons/time-clear.svg?inline";
import InIcon from "../assets/icons/time-in.svg?inline";
import OutIcon from "../assets/icons/time-out.svg?inline";

export default {
  components: {
    InIcon,
    OutIcon,
    ClearIcon,
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
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: null,
    },
    decimals: {
      type: Number,
      default: 2,
    },
    inButton: {
      type: Boolean,
      default: false,
    },
    outButton: {
      type: Boolean,
      default: false,
    },
    clearButton: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Number,
      default: null,
    },
    lazy: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "focus", "blur"],
  setup() {
    const { time: mediaTime, seekTo: seekMediaTo } = useModule("media_player");
    return { mediaTime, seekMediaTo };
  },
  data() {
    return {
      inputId: uuid(),
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        if (!this.lazy) {
          this.$emit("update:modelValue", round(value, this.decimals));
        }
      },
    },
  },
  methods: {
    onInputFocus() {
      this.$emit("focus");
    },
    onInputBlur() {
      this.$emit("blur");
    },
    onInputChange(evt) {
      if (this.lazy) {
        this.$emit("update:modelValue", round(evt.target.value, this.decimals));
      }
    },
    onClearClick() {
      this.value = null;
    },
    onInClick() {
      this.value = this.mediaTime;
    },
    onOutClick() {
      this.seekMediaTo(this.value);
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  .input-container {
    position: relative;
  }

  input {
    width: 6em;
    text-align: center;
  }

  .buttons {
    position: absolute;
    right: 0;
    bottom: 100%;
    display: flex;
    flex-direction: row;
    background-color: #3f3f3f;

    button {
      padding: 0.25em;
      font-size: 0.75em;

      .icon {
        width: 1em;
      }
    }
  }

  &:not(:hover) {
    .buttons {
      display: none;
    }
  }

  &.disabled {
    input {
      opacity: 0.5;
    }
  }
}
</style>
