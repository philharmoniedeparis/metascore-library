<template>
  <form-group :class="['control', 'file', { disabled }]" :label="label" :label-for="inputId" :description="description"
    :required="required">
    <input :id="inputId" v-autofocus="autofocus" type="file" :accept="accept" :multiple="multiple" :disabled="disabled"
      @change="onChange" />

    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </form-group>
</template>

<script>
import { v4 as uuid } from "uuid";

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
    disabled: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: null,
    },
    maxSize: {
      type: Number,
      default: null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Object,
      default: null,
    },
  },
  emits: ["update:modelValue"],
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
        this.$emit("update:modelValue", value);
      },
    },
  },
  methods: {
    onChange(evt) {
      const files = evt.target.files || evt.dataTransfer.files;
      if (!files.length) {
        return;
      }

      if (this.multiple) {
        this.value = Array.from(files).map(this.getFileInfo);
      } else {
        this.value = this.getFileInfo(files[0]);
      }
    },
    getFileInfo(file) {
      return {
        name: file.name,
        size: file.size,
        mime: file.type,
        url: URL.createObjectURL(file),
        file,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  &.disabled {
    input {
      opacity: 0.5;
    }
  }
}
</style>
