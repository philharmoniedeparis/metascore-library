<i18n>
{
}
</i18n>

<template>
  <div class="scenario">
    <h1>{{ model.name }}</h1>

    <template :key="child.id" v-for="child in model.children">
      <component :is="child.type" :model="child" />
    </template>
  </div>
</template>

<script>
import Block from "@/player/components/Block";

export default {
  components: {
    Block,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss"></style>
