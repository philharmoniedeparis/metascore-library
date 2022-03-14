<template>
  <form-group
    class="control"
    type="file"
    :label="label"
    :label-for="inputId"
    :description="description"
  >
    <input
      :id="inputId"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="onChange"
    />
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
        Promise.all(Array.from(files).map(this.getFileInfo)).then((infos) => {
          this.value = infos;
        });
      } else {
        this.getFileInfo(files[0]).then((info) => {
          this.value = info;
        });
      }
    },
    getFileInfo(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("error", reject);
        reader.addEventListener("load", () => {
          resolve({
            name: file.name,
            size: file.size,
            mime: file.type,
            dataURL: reader.result,
          });
        });
        reader.readAsDataURL(file);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  input {
    width: 100%;
    padding: 0.3125em;
    color: $white;
    background: $mediumgray;
    border: 1px solid $mediumgray;
    border-radius: 0.25em;
    box-sizing: border-box;

    &:focus,
    &:active,
    &:focus-visible {
      outline: 1px solid $lightgray;
      border-color: $lightgray;
    }
  }
}
</style>
