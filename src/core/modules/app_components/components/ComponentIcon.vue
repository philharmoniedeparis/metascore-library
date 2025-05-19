<template>
  <img v-if="url" :src="url" class="icon component-icon" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getURL } from "../utils/icons";

export default defineComponent ({
  props: {
    component: {
      type: Object,
      required: true,
    },
  },
  computed: {
    url() {
      return getURL(this.component);
    },
  },
});
</script>

<style lang="scss" scoped>
.icon {
  display: block;
}
</style>
