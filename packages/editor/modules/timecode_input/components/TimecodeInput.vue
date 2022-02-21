<template>
  <div class="timecode-input">
    <input
      ref="input"
      v-model="textualvalue"
      type="text"
      @change="onChange"
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
import { padStart, round, isNaN } from "lodash";
import ClearIcon from "../assets/icons/clear.svg?inline";
import InIcon from "../assets/icons/in.svg?inline";
import OutIcon from "../assets/icons/out.svg?inline";

/**
 * Time segements configurations
 * @type {Array}
 */
const SEGMENTS = [
  {
    name: "hours",
    regex: "[–0-9]{1,2}",
    multiplier: 3600,
    prefix: "",
    suffix: "",
    max_value: 99,
  },
  {
    name: "minutes",
    regex: "[–0-5]?[–0-9]",
    multiplier: 60,
    prefix: ":",
    suffix: "",
    max_value: 59,
  },
  {
    name: "seconds",
    regex: "[–0-5]?[–0-9]",
    multiplier: 1,
    prefix: ":",
    suffix: "",
    max_value: 59,
  },
  {
    name: "centiseconds",
    regex: "[–0-9]{1,2}",
    multiplier: 1 / 100,
    prefix: ".",
    suffix: "",
    max_value: 99,
  },
];

/**
 * A time segment's placeholder
 * @type {String}
 */
const SEGMENT_PLACEHOLDER = "––";

/**
 * A regular expression used to retrieve the values of each part
 * @type {RegExp}
 */
const REGEX = new RegExp(
  `^${SEGMENTS.reduce((accumulator, value) => {
    return `${accumulator + value.prefix}(${value.regex})${value.suffix}`;
  }, "")}$`
);

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
      keys_pressed: 0,
      focused_segment: null,
      /**
       * Whether to skip setting the focused segment on focus
       * @type {Boolean}
       */
      skip_focus: false,
      /**
       * Whether an input occured but the current value has not yet been updated
       * @type {Boolean}
       */
      dirty: false,
    };
  },
  computed: {
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
  methods: {
    onMousedown() {
      this.skip_focus = true;
    },
    onWheel(evt) {
      const segment = this.getFocusedSegment();

      if (typeof segment !== "undefined") {
        if (evt.deltaY < 0) {
          this.incrementSegmentValue(segment);
          this.setFocusedSegment(segment);
        } else if (evt.deltaY > 0) {
          this.decrementSegmentValue(segment);
          this.setFocusedSegment(segment);
        }
      }
    },
    onClick() {
      const caretPosition = this.getCaretPosition();
      this.setFocusedSegment(Math.floor(caretPosition / 3));
      this.skip_focus = false;
    },
    onFocus() {
      this.keys_pressed = 0;

      if (!this.skip_focus) {
        this.setFocusedSegment(0);
      }
    },
    onBlur() {
      if (this.dirty) {
        this.triggerUpdate();
      }
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
          const segment =
            this.getFocusedSegment() + (evt.key === "ArrowLeft" ? -1 : 1);

          if (segment >= 0 && segment < SEGMENTS.length) {
            this.setFocusedSegment(segment);
          }

          evt.preventDefault();
          break;
        }
        case "ArrowUp": {
          const segment = this.getFocusedSegment();

          if (typeof segment !== "undefined") {
            this.incrementSegmentValue(segment);
            this.setFocusedSegment(segment);
          }

          evt.preventDefault();
          break;
        }
        case "ArrowDown": {
          const segment = this.getFocusedSegment();

          if (typeof segment !== "undefined") {
            this.decrementSegmentValue(segment);
            this.setFocusedSegment(segment);
          }

          evt.preventDefault();
          break;
        }
        case "Tab": {
          const segment = this.getFocusedSegment() + (evt.shiftKey ? -1 : 1);

          if (segment >= 0 && segment < SEGMENTS.length) {
            this.setFocusedSegment(segment);
            evt.preventDefault();
          }

          break;
        }
      }
    },
    onKeypress(evt) {
      if (!isNaN(evt.key)) {
        const focused_segment = this.getFocusedSegment();

        // Numeric key
        if (focused_segment < SEGMENTS.length) {
          let segment_value = parseInt(
            this.getSegmentValue(focused_segment),
            10
          );

          if (this.keys_pressed === 0 || isNaN(segment_value)) {
            segment_value = 0;
          }

          segment_value += evt.key;

          segment_value = padStart(
            Math.min(
              SEGMENTS[focused_segment].max_value,
              parseInt(segment_value, 10)
            ),
            2,
            "0"
          );

          this.setSegmentValue(focused_segment, segment_value);

          if (++this.keys_pressed === 2) {
            this.keys_pressed = 0;
            this.setFocusedSegment(focused_segment + 1);
          } else {
            this.setFocusedSegment(focused_segment);
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
      return REGEX.test(value);
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
     * Helper function to retreive the index of the focused segmnet
     * @return {Number} The focus segment's index
     */
    getFocusedSegment() {
      return this.focused_segment;
    },
    /**
     * Helper function to set the focused segmnet
     * @param {Number} segment The focus segment's index
     */
    setFocusedSegment(segment) {
      const start = segment * 3;
      const end = start + 2;

      this.$refs.input.setSelectionRange(0, 0);
      this.$refs.input.setSelectionRange(start, end, "forward");

      /**
       * The index of the currenty focused segment
       * @type {Number}
       */
      this.focused_segment = segment;
    },
    /**
     * Helper function to retreive the value of a segmnet
     * @param {Number} segment The segment's index
     * @return {String} The segment's value
     */
    getSegmentValue(segment) {
      const textual_value = this.textualvalue;
      const matches = textual_value.match(REGEX);

      if (matches) {
        matches.shift();
        return matches[segment];
      }

      return null;
    },
    /**
     * Helper function to set the value of a segmnet
     * @param {Number} segment The segment's index
     * @param {String} value The segment's value
     */
    setSegmentValue(segment, value) {
      let textual_value = this.textualvalue;
      const matches = textual_value.match(REGEX);

      if (matches) {
        textual_value = "";
        matches.shift();

        matches.forEach((match, i) => {
          textual_value += SEGMENTS[i].prefix;
          textual_value +=
            i === segment ? value : matches[i] === "––" ? "00" : matches[i];
          textual_value += SEGMENTS[i].suffix;
        });

        this.$refs.input.value = textual_value;

        this.dirty = true;
      }
    },
    /**
     * Helper function to increment a segment's value
     * @param {Number} segment The segment's index
     */
    incrementSegmentValue(segment) {
      let value = this.value;

      if (value === null) {
        value = 0;
      }

      value += SEGMENTS[segment].multiplier;
      this.value = Math.max(0, value);
    },
    /**
     * Helper function to decrement a segment's value
     * @param {Number} segment The segment's index
     */
    decrementSegmentValue(segment) {
      let value = this.value;

      if (value === null) {
        value = 0;
      }

      if (value >= SEGMENTS[segment].multiplier) {
        value -= SEGMENTS[segment].multiplier;
        this.value = Math.max(0, value);
      }
    },
    /**
     * Helper function to convert a textual value to a numerical one
     * @param {String} textual_value The textual value
     * @return {Number} The numercial value
     */
    getNumericalValue(textual_value) {
      if (textual_value.indexOf(SEGMENT_PLACEHOLDER) !== -1) {
        return null;
      }

      let value = 0;
      const matches = textual_value.match(REGEX);

      if (matches) {
        matches.shift();

        matches.forEach((match, i) => {
          value += parseInt(matches[i], 10) * SEGMENTS[i].multiplier;
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

      SEGMENTS.forEach((segment) => {
        textual_value += segment.prefix;

        if (value === null) {
          textual_value += SEGMENT_PLACEHOLDER;
        } else {
          textual_value += padStart(
            parseInt(
              (value / segment.multiplier) % (segment.max_value + 1),
              10
            ) || 0,
            2,
            "0"
          );
        }

        textual_value += segment.suffix;
      });

      return textual_value;
    },
    triggerUpdate() {
      this.keys_pressed = 0;
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
    text-align: center;
  }
}
</style>
