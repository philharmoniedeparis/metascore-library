<template>
  <keep-alive>
    <slot v-if="active" />
  </keep-alive>
</template>

<script>
export default {
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
    this.$parent.addTab(this);
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
