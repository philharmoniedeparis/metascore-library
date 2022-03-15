<template>
  <div class="timecode-input">
    <input
      ref="input"
      v-model="textualvalue"
      type="text"
      @keypress="onKeypress"
      @mousedown="onMousedown"
      @wheel.prevent="onWheel"
      @click="onClick"
      @focus="onFocus"
      @blur="onBlur"
      @dragstart.prevent
      @drop.prevent
      @cut.prevent
      @paste.prevent="onPaste"
      @keydown="onKeydown"
    />
    <div v-if="inButton || outButton || clearButton" class="buttons">
      <button v-if="inButton" class="in" @click="onInClick">
        <span aria-hidden="true"><in-icon class="icon" /></span>
        <span class="sr-only">+</span>
      </button>
      <button v-if="outButton" class="out" @click="onOutClick">
        <span aria-hidden="true"><out-icon class="icon" /></span>
        <span class="sr-only">+</span>
      </button>
      <button v-if="clearButton" class="clear" @click="onClearClick">
        <span aria-hidden="true"><clear-icon class="icon" /></span>
        <span class="sr-only">+</span>
      </button>
    </div>
  </div>
</template>

<script>
import toRegexRange from "to-regex-range";
import { padStart, round, isNaN } from "lodash";
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
          },
          {
            name: "minutes",
            multiplier: 60,
            max: 60,
            prefix: ":",
          },
          {
            name: "seconds",
            multiplier: 1,
            max: 60,
            prefix: ":",
          },
          {
            name: "centiseconds",
            multiplier: 0.01,
            max: 100,
            prefix: ".",
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
  emits: ["update:modelValue"],
  data() {
    return {
      keysPressed: 0,
      /**
       * The index of the currenty focused segment
       * @type {Number}
       */
      focusedSegment: null,
      /**
       * Whether an input occured but the current value has not yet been updated
       * @type {Boolean}
       */
      dirty: false,
    };
  },
  computed: {
    regexp() {
      let regexp = "";

      this.segments.forEach((segment) => {
        const rangeRegex = toRegexRange(0, segment.max);
        regexp += `${segment.prefix}(${this.placeholder}|${rangeRegex})`;
      });

      return new RegExp(`^${regexp}$`);
    },
    textualvalue: {
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
    modelValue() {
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
    onClick() {
      const caretPosition = this.getCaretPosition();
      this.focusedSegment = Math.floor(caretPosition / 3);
    },
    onFocus() {
      this.focusedSegment = 0;
    },
    onBlur() {
      if (this.dirty) {
        this.triggerUpdate();
      }
      this.keysPressed = 0;
      this.focusedSegment = null;
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
      if (!isNaN(evt.key)) {
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
              this.segments[this.focusedSegment].max_value,
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
      this.$emits("valuein");
    },
    onOutClick() {
      this.emits("valueout", { value: this.value });
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
        const start = this.focusedSegment * 3;
        const end = start + 2;

        this.$refs.input.setSelectionRange(0, 0);
        this.$refs.input.setSelectionRange(start, end, "forward");
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
      const textual_value = this.textualvalue;
      const matches = textual_value.match(this.regexp);

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
      let textual_value = this.textualvalue;
      const matches = textual_value.match(this.regexp);

      if (matches) {
        textual_value = "";
        matches.shift();

        matches.forEach((match, i) => {
          textual_value += this.segments[i].prefix;
          textual_value +=
            i === index ? value : matches[i] === "––" ? "00" : matches[i];
          textual_value += this.segments[i].suffix;
        });

        this.$refs.input.value = textual_value;

        this.dirty = true;
      }
    },
    /**
     * Helper function to increment a segment's value
     * @param {Number} index The segment's index
     */
    incrementSegmentValue(index) {
      let value = this.value;

      if (value === null) {
        value = 0;
      }

      value += this.segments[index].multiplier;
      this.value = Math.max(0, value);
    },
    /**
     * Helper function to decrement a segment's value
     * @param {Number} index The segment's index
     */
    decrementSegmentValue(index) {
      let value = this.value;

      if (value === null) {
        value = 0;
      }

      if (value >= this.segments[index].multiplier) {
        value -= this.segments[index].multiplier;
        this.value = Math.max(0, value);
      }
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
  input {
    width: 6em;
    text-align: center;
  }
}
</style>
