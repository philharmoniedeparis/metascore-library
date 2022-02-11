<template>
  <div class="metaScore-player">
    <app-renderer :url="url" :api="api" />
  </div>
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
