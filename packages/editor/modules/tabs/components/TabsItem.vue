<template>
  <keep-alive>
    <slot v-if="active" />
  </keep-alive>
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
