<template>
  <base-modal class="modal-form" @close="$emit('close')">
    <template v-if="$slots.title" #title>
      <slot name="title" />
    </template>

    <div v-if="description || $slots.description" class="description">
      <p v-if="description">{{ description }}</p>
      <slot v-else name="description" />
    </div>

    <form
      :id="uuid"
      :novalidate="!validate"
      @submit.stop.prevent="$emit('submit')"
    >
      <slot />
    </form>

    <template #footer>
      <slot name="actions" :form="uuid" />
    </template>
  </base-modal>
</template>

<script>
import { v4 as uuid } from "uuid";

export default {
  props: {
    description: {
      type: String,
      default: null,
    },
    validate: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["submit", "close"],
  data() {
    return {
      uuid: uuid(),
    };
  },
};
</script>

<style scoped lang="scss">
.modal-form {
  .description {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    p:first-child {
      margin-top: 0;
    }

    p:last-child {
      margin-bottom: 0;
    }

    .danger {
      color: #cd2453;
    }
  }
}
</style>
