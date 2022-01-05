<template>
  <app-renderer :url="url" :api="api" />
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    api: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
