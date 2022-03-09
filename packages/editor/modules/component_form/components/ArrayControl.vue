<template>
  <form-group class="control array" :data-property="property" :label="label">
    <template v-for="(item, index) in schema.items" :key="index">
      <control-dispatcher
        :property="`${index}`"
        :schema="item"
        :model-value="value[index]"
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
    property: {
      type: String,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
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
  },
  methods: {
    update(index, value) {
      const updated = [...this.value];
      updated[index] = value;
      this.value = updated;
    },
  },
};
</script>
