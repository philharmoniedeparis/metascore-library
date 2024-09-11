<template>
  <div
    :tabindex="searchable ? -1 : tabindex"
    :class="['multiselect', { multiple, searchable, active: isOpen }]"
    role="combobox"
    @focus="activate()"
    @blur="searchable ? false : deactivate()"
    @keyup.esc="deactivate()"
  >
    <div class="formatted">
      {{ formatValue(getValue()) }}
      <div v-for="(option, index) in selectedOptions" :key="index" class="tag">
        {{ getOptionLabel(option) }}
      </div>
    </div>
    <ul v-show="isOpen" class="menu" role="listbox">
      <li v-if="searchable" class="search">
        <input
          ref="search"
          v-model="search"
          type="text"
          :spellcheck="false"
          @focus.prevent="activate()"
          @blur.prevent="deactivate()"
          @keyup.esc="deactivate()"
        />
      </li>
      <li
        v-for="(option, index) in options"
        :key="index"
        :class="['option', { selected: isOptionSelected(option) }]"
      >
        <label>
          <input
            :type="multiple ? 'checkbox' : 'radio'"
            :value="getOptionValue(option)"
            :checked="isOptionSelected(option)"
            @change.stop="onOptionChange"
          />
          {{ getOptionLabel(option) }}
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { isEqual } from "lodash";

export default defineComponent({
  props: {
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    tabindex: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    formatValue: {
      type: Function,
      default() {
        return (value) => {
          return value;
        };
      },
    },
  },
  emits: ["close", "change"],
  setup(props, { expose }) {
    const search = ref("");
    const isOpen = ref(false);
    const selectedValues = ref([]);

    const getValue = () => {
      return props.multiple
        ? [...selectedValues.value]
        : (selectedValues.value.at(0) ?? null);
    };

    const setValue = (newValue) => {
      if (isEqual(newValue, selectedValues.value)) return;

      if (newValue === null || newValue === undefined) {
        selectedValues.value = [];
      } else {
        selectedValues.value = Array.isArray(newValue) ? newValue : [newValue];
      }
    };

    expose({ getValue, setValue });

    return { search, isOpen, selectedValues, getValue, setValue };
  },
  computed: {
    selectedOptions() {
      return this.options.filter((option) => {
        return this.isOptionSelected(option);
      });
    },
  },
  watch: {
    selectedValues: {
      handler() {
        this.$emit("change");
      },
      deep: true,
    },
  },
  mounted() {
    const hostNode = this.$el.getRootNode()?.host;
    hostNode.addEventListener("focus", this.activate);
  },
  methods: {
    activate() {
      if (this.isOpen || this.disabled) return;
      this.isOpen = true;
      if (this.searchable) {
        this.$refs.search.focus();
      } else {
        this.$el.focus();
      }
    },
    deactivate() {
      if (!this.isOpen) return;
      this.isOpen = false;

      if (this.searchable) {
        this.$refs.search.blur();
      } else {
        this.$el.blur();
      }

      this.search = "";
      this.$emit("close");
    },
    getOptionLabel(option) {
      if (typeof option === "string") return option;
      return option.at(0);
    },
    getOptionValue(option) {
      if (typeof option === "string") return option;
      return option.at(1);
    },
    isOptionSelected(option) {
      const value = this.getOptionValue(option);
      return this.multiple
        ? this.selectedValues?.includes(value)
        : value === this.selectedValues.at(0);
    },
    onOptionChange(event) {
      const value = event.target.value;
      const selected = event.target.checked;

      if (selected) {
        this.multiple
          ? this.selectedValues.push(value)
          : (this.selectedValues = [value]);
      } else {
        this.multiple
          ? (this.selectedValues = this.selectedValues.filter(
              (v) => v !== value
            ))
          : (this.selectedValues = []);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.multiselect {
  position: relative;
  height: 100%;
  background: #fff;
}

.tags {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 0.2em;
  box-sizing: border-box;
}

.tag {
  padding: 0 0.25em;
  color: white;
  background-color: green;
  border-radius: 0.25em;
  white-space: nowrap;
}

.menu {
  position: absolute;
  top: 100%;
  display: flex;
  min-width: 100%;
  max-height: 300px;
  margin: 0;
  padding: 0;
  flex-direction: column;
  list-style: none;
  background: #fff;
}

.search {
  input {
    width: 100%;
  }
}

.option {
  &.selected {
    background: green;
  }
}
</style>
