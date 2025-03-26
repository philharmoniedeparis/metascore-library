<template>
  <Transition name="fade">
    <intro-tour v-if="stepCount > 0 && !closed" @close="closed = true" />
  </Transition>
</template>

<script>
import useStore from "../store";
import IntroTour from "./IntroTour.vue";

/**
 * A wrapper component for the intro-tour,
 * it is required to make the intro-tour component call it's lifecycle hooks;
 * namely the 'beforeUnmount' one.
 */
export default {
  components: {
    IntroTour,
  },
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      closed: false,
    };
  },
  computed: {
    stepCount() {
      return this.store.configs.steps.length;
    },
  },
};
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
