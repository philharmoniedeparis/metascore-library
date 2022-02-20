<template>
  <context-menu class="metaScore-player">
    <app-renderer :url="url" :api="api" />

    <template #footer>
      {{ `metaScore Player ${version}` }}
    </template>
  </context-menu>
</template>

<script>
import { mapActions } from "vuex";
import packageInfo from "../../package.json";

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    api: {
      type: Boolean,
      default: false,
    },
  },
  date() {
    return {
      version: packageInfo.version,
    };
  },
  async mounted() {
    await this.load(this.url);
  },
  methods: {
    ...mapActions(["load"]),
  },
};
</script>
