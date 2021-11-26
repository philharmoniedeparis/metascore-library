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
import { mapState } from "vuex";

export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState("media", {
      mediaTime: "time",
    }),
    startTime() {
      return this.model["start-time"];
    },
    endTime() {
      return this.model["end-time"];
    },
    active() {
      if (this.startTime === null && this.endTime === null) {
        return true;
      }

      return this.mediaTime >= this.startTime && this.mediaTime <= this.endTime;
    },
  },
};
</script>

<style lang="scss" scoped></style>
