<template>
  <form-group :class="['control', 'dropdown-button', { disabled }]" :description="description" :required="required">
    <base-button ref="button" type="button" :aria-expanded="expanded" aria-haspopup="true" :aria-controls="dropdownId"
      :disabled="disabled" @click="onButtonClick" @mousedown.stop>
      <template v-if="label">
        {{ label }}
      </template>
      <template v-else-if="$slots.label">
        <slot name="label" />
      </template>
    </base-button>

    <teleport :to="overlaysTarget" :disabled="disabled || !overlaysTarget">
      <nav :id="dropdownId" ref="dropdown" :class="['dropdown-button--menu', { expanded }]" :style="dropdownStyle">
        <slot name="dropdownHeading" />

        <ul role="menu">
          <li v-for="(option, index) in options" :key="index" :disabled="option.disabled"
            :aria-current="option.value === value ? 'true' : 'false'" :class="{ selected: option.value === value }"
            role="presentation">
            <button role="menuitem" type="button" @click="onOptionClick(option)">
              {{ option.label }}
            </button>
          </li>
        </ul>
      </nav>
    </teleport>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";
import { computePosition, flip } from "@floating-ui/dom";

export default {
  inject: {
    overlaysTarget: {
      default: null,
    },
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
    disabled: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: [String, Number, Array, Object],
      default: null,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      expanded: false,
      dropdownId: uuid(),
      dropdownStyle: null,
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  watch: {
    expanded(value) {
      if (value) {
        this.updateDropdownStyle();

        this.$el.ownerDocument.addEventListener(
          "focusin",
          this.onDocumentFocusin
        );
        this.$el.ownerDocument.addEventListener(
          "mousedown",
          this.onDocumentMousedown
        );
      } else {
        this.$el.ownerDocument.removeEventListener(
          "focusin",
          this.onDocumentFocusin
        );
        this.$el.ownerDocument.removeEventListener(
          "mousedown",
          this.onDocumentMousedown
        );
      }
    },
  },
  beforeUnmount() {
    this.$el.ownerDocument.removeEventListener(
      "focusin",
      this.onDocumentFocusin
    );
    this.$el.ownerDocument.removeEventListener(
      "mousedown",
      this.onDocumentMousedown
    );
  },
  methods: {
    onButtonClick() {
      this.expanded = !this.expanded;
    },
    onOptionClick(option) {
      this.value = option.value;
      this.expanded = false;
    },
    async updateDropdownStyle() {
      const { x, y } = await computePosition(
        this.$refs.button.$el,
        this.$refs.dropdown,
        {
          strategy: "fixed",
          placement: "bottom-start",
          middleware: [flip()],
        }
      );

      this.dropdownStyle = {
        left: `${x}px`,
        top: `${y}px`,
      };
    },
    onDocumentFocusin(evt) {
      if (!this.$refs.dropdown.contains(evt.target)) {
        this.expanded = false;
      }
    },
    onDocumentMousedown(evt) {
      if (!this.$refs.dropdown.contains(evt.target)) {
        this.expanded = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  position: relative;

  &.disabled {
    >button {
      opacity: 0.5;
    }
  }
}

.dropdown-button--menu {
  position: fixed;
  top: 0;
  left: 0;
  width: max-content;
  background: var(--metascore-color-bg-secondary);
  box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.5);
  z-index: 999;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  button {
    width: 100%;
    padding: 0.25em 0.5em;
    text-align: left;
    color: var(--metascore-color-text-primary);
    background: var(--metascore-color-bg-secondary);
    border: none;

    &:hover {
      background: var(--metascore-color-bg-tertiary);
    }
  }

  li {
    &.selected {
      button {
        background: var(--metascore-color-bg-tertiary);
      }
    }
  }

  &:not(.expanded) {
    display: none;
  }
}
</style>
