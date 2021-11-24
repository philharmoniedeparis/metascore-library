<i18n>
{
}
</i18n>

<template>
  <div class="block">
    <h4>{{ model.name }}</h4>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss"></style>
