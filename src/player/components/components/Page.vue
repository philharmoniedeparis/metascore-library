<i18n>
{
}
</i18n>

<template>
  <div
    v-show="active"
    :id="model.id"
    :class="['metaScore-component', 'page', { active }]"
  >
    Page
  </div>
</template>

<script>
import useTime from "@/player/composables/useTime";

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
    return {
      ...useTime(props.model),
    };
  },
};
</script>

<style lang="scss" scoped></style>
