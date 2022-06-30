<i18n>
{
  "fr": {
    "triggers_title": "Déclencheurs",
    "conditions_title": "Conditions et opérateurs",
    "actions_title": "Actions",
    "variables_title": "Variables",
  },
  "en": {
    "triggers_title": "Triggers",
    "conditions_title": "Conditions and operators",
    "actions_title": "Actions",
    "variables_title": "Variables",
  }
}
</i18n>

<template>
  <div class="behaviors-form">
    <collapsible-panel :expanded="true">
      <template #title>{{ $t("triggers_title") }}</template>
    </collapsible-panel>

    <collapsible-panel :expanded="true">
      <template #title>{{ $t("conditions_title") }}</template>
    </collapsible-panel>

    <collapsible-panel :expanded="true">
      <template #title>{{ $t("actions_title") }}</template>
    </collapsible-panel>

    <collapsible-panel :expanded="true">
      <template #title>{{ $t("variables_title") }}</template>
    </collapsible-panel>
  </div>
</template>

<script>
import useStore from "../store";

export default {
  props: {},
  setup() {
    const store = useStore();
    return {
      store,
    };
  },
  computed: {},
};
</script>

<style lang="scss" scoped>
.behaviors-form {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 0.75em;
  padding: 0.5em;
  background: $lightgray;
  overflow-x: hidden;
  overflow-y: auto;
  color: $white;
}
</style>
