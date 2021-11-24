<template>
  Player

  <template :key="scenario.id" v-for="scenario in getScenarios()">
    <Scenario :model="scenario" />
  </template>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Scenario from "@/player/components/Scenario";

export default {
  components: {
    Scenario,
  },
  mounted() {
    this.loadComponents();

    console.log(this.getScenarios());
  },
  methods: {
    ...mapGetters("components", ["getScenarios"]),
    ...mapActions("components", { loadComponents: "load" }),
  },
};
</script>

<style lang="scss"></style>
