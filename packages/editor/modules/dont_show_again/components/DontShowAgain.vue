<i18n>
  {
    "fr": {
      "label": "Ne plus afficher",
    },
    "en": {
      "label": "Don't show again",
    },
  }
</i18n>

<template>
  <checkbox-control
    v-model="active"
    class="dont-show-again"
    :label="$t('label')"
  />
</template>

<script>
import * as api from "../api";

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      active: false,
    };
  },
  beforeUnmount() {
    if (this.active) {
      api.save(this.url);
    }
  },
};
</script>
