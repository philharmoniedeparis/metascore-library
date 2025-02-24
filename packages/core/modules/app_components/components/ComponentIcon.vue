<template>
  <inline-svg v-if="url" :src="url" class="icon component-icon"></inline-svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import InlineSvg from "vue-inline-svg";
import { getURL } from "../utils/icons";

export default defineComponent ({
  components: {
    InlineSvg,
  },
  props: {
    component: {
      type: Object,
      required: true,
    },
  },
  computed: {
    url() {
      const url = getURL(this.component);
      return url ? `${url}#` : null;
    },
  },
});
</script>

<style lang="scss" scoped>
.icon {
  display: block;
}
</style>
