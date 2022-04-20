<template>
  <form-group
    :class="['control', 'array', { readonly, disabled }]"
    :data-property="property"
    :label="label"
    :description="description"
    :required="required"
  >
    <template v-for="(item, index) in items" :key="index">
      <control-dispatcher
        :property="`${index}`"
        :schema="item"
        :model-value="value[index]"
        :readonly="readonly"
        :disabled="disabled"
        v-bind="getItemProps(index)"
        @update:model-value="update(index, $event)"
      />
    </template>
  </form-group>
</template>

<script>
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
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    property: {
      type: String,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
    },
    itemProps: {
      type: [Object, Array],
      default() {
        return {};
      },
    },
    modelValue: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  emits: ["update:modelValue"],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    items() {
      if (Array.isArray(this.schema.items)) {
        return this.schema.items;
      }

      if (this.value.length > 0) {
        return [].fill(this.schema.items, 0, this.value.length);
      }

      if (this.schema.minItems) {
        return [].fill(this.schema.items, 0, this.schema.minItems);
      }

      return [this.schema.items];
    },
  },
  methods: {
    getItemProps(index) {
      if (Array.isArray(this.itemProps)) {
        return this.itemProps[index] || {};
      }
      return this.itemProps;
    },
    update(index, value) {
      const updated = [...this.value];
      updated[index] = value;
      this.value = updated;
    },
  },
};
</script>
