<template>
  <div class="control array" :data-property="property">
    <label v-if="label">{{ label }}</label>
    <template v-for="(item, index) in schema.items" :key="index">
      <control-dispatcher
        :property="`${index}`"
        :schema="item"
        :value="value[index]"
        @change="onChange"
      />
    </template>
  </div>
</template>

<script>
import ControlDispatcher from "./ControlDispatcher.vue";

export default {
  components: {
    ControlDispatcher,
  },
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
    value: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  emits: ["change"],
  methods: {
    onChange(evt) {
      const value = this.value;
      value[evt.property] = evt.value;

      this.$emit("change", {
        property: this.property,
        value,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
