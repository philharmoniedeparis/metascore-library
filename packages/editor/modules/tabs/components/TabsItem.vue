<template>
  <div
    v-if="active || (keepAlive && initialized)"
    v-show="active"
    class="tab-item"
  >
    <slot />
  </div>
</template>

<script>
export default {
  inject: ["addTab"],
  props: {
    title: {
      type: String,
      required: true,
    },
    keepAlive: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      initialized: false,
      active: false,
    };
  },
  created() {
    this.addTab(this);
  },
  methods: {
    activate() {
      this.initialized = true;
      this.active = true;
    },
    deactivate() {
      this.active = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.tab-item {
  flex: 1 1 100%;
  overflow-y: auto;
}
</style>
