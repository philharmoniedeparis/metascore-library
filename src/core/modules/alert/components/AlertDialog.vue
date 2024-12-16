<i18n>
{
  "fr": {
    "button": "OK",
  },
  "en": {
    "button": "OK",
  },
}
</i18n>

<template>
  <base-modal :show="show" class="alert-dialog" @close="$emit('close')">
    <div class="text">
      <slot v-if="$slots.default" />
      <template v-else>{{ text }}</template>
    </div>

    <template #footer>
      <base-button type="button" role="primary" @click="$emit('close')">
        {{ buttonLabelWithDefault }}
      </base-button>
    </template>
  </base-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent ({
  props: {
    show: {
      type: Boolean,
      default: true,
    },
    text: {
      type: String,
      default: null,
    },
    buttonLabel: {
      type: String,
      default: null,
    },
  },
  emits: ["close"],
  computed: {
    buttonLabelWithDefault() {
      return this.buttonLabel ?? this.$t("button");
    },
  },
});
</script>

<style scoped lang="scss">
.alert-dialog {
  .text {
    color: var(--metascore-color-white, white);
    text-align: center;

    :deep(p) {
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
