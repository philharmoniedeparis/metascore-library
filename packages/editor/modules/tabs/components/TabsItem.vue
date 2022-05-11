<template>
  <div v-if="active" class="tab-item">
    <keep-alive>
      <slot />
    </keep-alive>
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
  },
  data() {
    return {
      active: false,
    };
  },
  created() {
    this.addTab(this);
  },
  methods: {
    activate() {
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
