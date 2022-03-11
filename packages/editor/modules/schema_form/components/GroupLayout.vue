<template>
  <fieldset class="form-layout group">
    <legend v-if="label">{{ label }}</legend>

    <slot />
  </fieldset>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: null,
    },
  },
};
</script>

<style lang="scss" scoped>
.form-layout.group {
  margin-bottom: 0.5em;
  border: 1px solid $darkgray;

  > legend {
    padding: 0.25em 0.5em;
    color: $white;
    background: $mediumgray;
    text-align: left;
  }
}
</style>
