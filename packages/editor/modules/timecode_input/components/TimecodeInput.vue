<template>
  <div class="timecode-input" @focusin="onFocus" @focusout="onBlur">
    <input
      ref="input"
      v-model="textualValue"
      type="text"
      :readonly="readonly"
      :disabled="disabled"
      @keypress="onKeypress"
      @mousedown="onMousedown"
      @wheel.prevent="onWheel"
      @click="onClick"
      @dragstart.prevent
      @drop.prevent
      @cut.prevent
      @paste.prevent="onPaste"
      @keydown="onKeydown"
    />
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
</template>

<script>
import { padStart, round, toNumber } from "lodash";
import ClearIcon from "../assets/icons/clear.svg?inline";
import InIcon from "../assets/icons/in.svg?inline";
import OutIcon from "../assets/icons/out.svg?inline";

export default {
  components: {
    InIcon,
    OutIcon,
    ClearIcon,
  },
  props: {
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    segments: {
      type: Array,
      default() {
        return [
          {
            name: "hours",
            multiplier: 3600,
            max: 99,
            prefix: "",
            regex: "[–0-9]{1,2}",
          },
          {
            name: "minutes",
            multiplier: 60,
            max: 59,
            prefix: ":",
            regex: "[–0-5]?[–0-9]",
          },
          {
            name: "seconds",
            multiplier: 1,
            max: 59,
            prefix: ":",
            regex: "[–0-5]?[–0-9]",
          },
          {
            name: "centiseconds",
            multiplier: 0.01,
            max: 99,
            prefix: ".",
            regex: "[–0-9]{1,2}",
          },
        ];
      },
    },
    placeholder: {
      type: String,
      default: "--",
    },
    separator: {
      type: String,
      default: ":",
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: null,
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
  },
  emits: ["update:modelValue", "focus", "blur", "valuein", "valueout"],
  data() {
    return {
      keysPressed: 0,
      /**
       * The index of the currenty focused segment
       * @type {Number}
       */
      focusedSegment: null,
      /**
       * Whether to skip setting the focused segment on focus
       * @type {Boolean}
       */
      skipFocus: false,
      /**
       * Whether an input occured but the current value has not yet been updated
       * @type {Boolean}
       */
      dirty: false,
    };
  },
  computed: {
    regexp() {
      let regexp = this.segments
        .map((s) => {
          return `${s.prefix}(${s.regex})`;
        })
        .join("");

      return new RegExp(`^${regexp}$`);
    },
    textualValue: {
      get() {
        return this.getTextualValue(this.modelValue);
      },
      set(value) {
        this.value = this.getNumericalValue(value);
      },
    },
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        if (value !== null) {
          value = round(value, 2);

          if (this.min !== null) {
            value = Math.max(value, this.min);
          }

          if (this.max !== null) {
            value = Math.min(value, this.max);
          }
        }

        this.$emit("update:modelValue", value);
      },
    },
  },
  watch: {
    focusedSegment() {
      this.updateSelection();
    },
    textualValue() {
      this.updateSelection();
    },
  },
  methods: {
    onWheel(evt) {
      if (this.focusedSegment !== null) {
        if (evt.deltaY < 0) {
          this.incrementSegmentValue(this.focusedSegment);
        } else if (evt.deltaY > 0) {
          this.decrementSegmentValue(this.focusedSegment);
        }
      }
    },
    onMousedown() {
      this.skipFocus = true;
    },
    onClick() {
      const caret_position = this.getCaretPosition();
      this.focusedSegment = Math.floor(caret_position / 3);
      this.skipFocus = false;
    },
    onFocus() {
      this.keysPressed = 0;
      if (!this.skipFocus) {
        this.focusedSegment = 0;
      }
      this.$emit("focus");
    },
    onBlur() {
      if (this.dirty) {
        this.triggerUpdate();
      }
      this.keysPressed = 0;
      this.focusedSegment = null;
      this.$emit("blur");
    },
    onPaste(evt) {
      const clipboard_data = evt.clipboardData || window.clipboardData;
      const pasted_data = clipboard_data.getData("Text");

      if (this.isValueValid(pasted_data)) {
        this.value = this.getNumericalValue(pasted_data);
      }
    },
    onKeydown(evt) {
      switch (evt.key) {
        case "ArrowLeft":
        case "ArrowRight": {
          const index =
            this.focusedSegment + (evt.key === "ArrowLeft" ? -1 : 1);

          if (index >= 0 && index < this.segments.length) {
            this.focusedSegment = index;
          }

          evt.preventDefault();
          break;
        }
        case "ArrowUp": {
          if (this.focusedSegment !== null) {
            this.incrementSegmentValue(this.focusedSegment);
          }

          evt.preventDefault();
          break;
        }
        case "ArrowDown": {
          if (this.focusedSegment !== null) {
            this.decrementSegmentValue(this.focusedSegment);
          }

          evt.preventDefault();
          break;
        }
        case "Tab": {
          const index = this.focusedSegment + (evt.shiftKey ? -1 : 1);

          if (index >= 0 && index < this.segments.length) {
            this.focusedSegment = index;
            evt.preventDefault();
          }

          break;
        }
      }
    },
    onKeypress(evt) {
      if (!isNaN(toNumber(evt.key))) {
        // Numeric key
        if (this.focusedSegment < this.segments.length) {
          let segment_value = parseInt(
            this.getSegmentValue(this.focusedSegment),
            10
          );

          if (this.keysPressed === 0 || isNaN(segment_value)) {
            segment_value = 0;
          }

          segment_value += evt.key;

          segment_value = padStart(
            Math.min(
              this.segments[this.focusedSegment].max,
              parseInt(segment_value, 10)
            ),
            2,
            "0"
          );

          this.setSegmentValue(this.focusedSegment, segment_value);

          if (++this.keysPressed === 2) {
            this.keysPressed = 0;
            this.focusedSegment++;
          }
        }
      } else if (evt.key === "Enter" && this.dirty) {
        this.triggerUpdate();
      }

      evt.preventDefault();
    },
    onClearClick() {
      this.value = null;
    },
    onInClick() {
      this.$emit("valuein");
    },
    onOutClick() {
      this.$emit("valueout", { value: this.value });
    },

    /**
     * Helper function to check if a certain value is a valid textual value
     * @param {String} value The value to check
     */
    isValueValid(value) {
      return this.regexp.test(value);
    },
    updateSelection() {
      if (this.focusedSegment !== null) {
        this.$nextTick(function () {
          const input = this.$refs.input;
          const start = this.focusedSegment * 3;
          const end = start + 2;

          input.setSelectionRange(0, 0);
          input.setSelectionRange(start, end);
        });
      }
    },
    /**
     * Helper function to retreive the input's current caret position
     * @return {Number} The caret position
     */
    getCaretPosition() {
      const input = this.$refs.input;
      let caretPosition = 0;

      if (typeof input.selectionStart === "number") {
        caretPosition =
          input.selectionDirection === "backward"
            ? input.selectionStart
            : input.selectionEnd;
      }

      return caretPosition;
    },
    /**
     * Helper function to retreive the value of a segmnet
     * @param {Number} index The segment's index
     * @return {String} The segment's value
     */
    getSegmentValue(index) {
      const matches = this.textualValue.match(this.regexp);

      if (matches) {
        matches.shift();
        return matches[index];
      }

      return null;
    },
    /**
     * Helper function to set the value of a segmnet
     * @param {Number} index The segment's index
     * @param {String} value The segment's value
     */
    setSegmentValue(index, value) {
      let textual_value = this.textualValue;
      const matches = textual_value.match(this.regexp);

      if (matches) {
        textual_value = "";
        matches.shift();

        matches.forEach((match, i) => {
          textual_value += this.segments[i].prefix;
          textual_value +=
            i === index ? value : matches[i] === "––" ? "00" : matches[i];
        });

        this.textualValue = textual_value;

        this.dirty = true;
      }
    },
    /**
     * Helper function to increment a segment's value
     * @param {Number} index The segment's index
     */
    incrementSegmentValue(index) {
      if (this.value === null) {
        this.value = 0;
      }

      this.value += this.segments[index].multiplier;
    },
    /**
     * Helper function to decrement a segment's value
     * @param {Number} index The segment's index
     */
    decrementSegmentValue(index) {
      if (this.value === null) {
        this.value = 0;
      }

      this.value -= this.segments[index].multiplier;
    },
    /**
     * Helper function to convert a textual value to a numerical one
     * @param {String} textual_value The textual value
     * @return {Number} The numercial value
     */
    getNumericalValue(textual_value) {
      if (textual_value.indexOf(this.placeholder) !== -1) {
        return null;
      }

      let value = 0;
      const matches = textual_value.match(this.regexp);

      if (matches) {
        matches.shift();

        matches.forEach((match, i) => {
          value += parseInt(matches[i], 10) * this.segments[i].multiplier;
        });
      }

      return value;
    },
    /**
     * Helper function to convert a numerical value to a textual one
     * @param {Number} value The numercial value
     * @return {String} The textual value
     */
    getTextualValue(value) {
      let textual_value = "";

      this.segments.forEach((segment) => {
        textual_value += segment.prefix;

        if (value === null) {
          textual_value += this.placeholder;
        } else {
          textual_value += padStart(
            parseInt((value / segment.multiplier) % (segment.max + 1), 10) || 0,
            2,
            "0"
          );
        }
      });

      return textual_value;
    },
    triggerUpdate() {
      this.keysPressed = 0;
      this.focused_segment = null;

      if (this.dirty) {
        this.dirty = false;
        this.value = this.getNumericalValue(this.$refs.input.value);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.timecode-input {
  position: relative;

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
}
</style>
