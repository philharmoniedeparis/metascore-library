<i18n>
{
  "fr": {
    "title": "Raccourcis clavier",
    "keys": "Combinaison de touches",
    "description": "Description",
  },
  "en": {
    "title": "Keyboard shortcuts",
    "keys": "Key combination",
    "description": "Description",
  },
}
</i18n>

<template>
  <base-modal class="hotkey-list" :title="$t('title')" @close="$emit('close')">
    <section
      v-for="(combinations, title) in hotkeys"
      :key="title"
      class="group"
    >
      <h4>{{ title }}</h4>
      <table>
        <thead>
          <tr>
            <th>{{ $t("keys") }}</th>
            <th>{{ $t("description") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(description, keys) in Object.fromEntries(combinations)"
            :key="keys"
          >
            <td>
              <kbd
                v-for="(key, index) in keys.split('+')"
                :key="key"
                class="combo"
              >
                <span v-if="index !== 0" class="key-separator">+</span>
                <kbd class="key">{{ key }}</kbd>
              </kbd>
            </td>
            <td>{{ description }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </base-modal>
</template>

<script>
import useStore from "../store";

export default {
  emits: ["close"],
  setup() {
    const store = useStore();
    return { store };
  },
  computed: {
    hotkeys() {
      return Object.fromEntries(this.store.hotkeys);
    },
  },
};
</script>

<style lang="scss" scoped>
.hotkey-list {
  section {
    color: $white;
  }

  th,
  td {
    padding: 0.5em 1em 0.5em 0;
  }

  th {
    border-bottom: 2px solid $white;
    white-space: nowrap;
  }

  kbd.key {
    display: inline-block;
    color: $black;
    text-align: center;
    line-height: 1em;
    padding: 0.25em 0.5em;
    border-radius: 0.25em;
    background: #f7f7f7;
    border: 1px solid #bbb;
  }
}
</style>
