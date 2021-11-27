<i18n>
{
}
</i18n>

<template>
  <div v-show="active" :class="['metaScore-component', 'page', { active }]">
    Page
  </div>
</template>

<script>
import { computed } from "vue";
import useCuePoint from "@/player/composables/useCuePoint";

export default {
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const startTime = computed(() => props.model["start-time"]);
    const endTime = computed(() => props.model["end-time"]);
    return {
      ...useCuePoint(startTime, endTime),
    };
  },
};
</script>

<style lang="scss" scoped></style>
