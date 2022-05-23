<i18n>
{
  "fr": {
    "title": "Raccourcis clavier",
    "combo": "Combinaison de touches",
    "description": "Description",
    "keys": {
      "space": "Barre d'espace",
      "up": "▲",
      "right": "▶",
      "down": "▼",
      "left": "◀",
    },
  },
  "en": {
    "title": "Keyboard shortcuts",
    "combo": "Key combination",
    "description": "Description",
    "keys": {
      "space": "Spacebar",
      "up": "▲",
      "right": "▶",
      "down": "▼",
      "left": "◀",
    },
  },
}
</i18n>

<template>
  <base-modal class="hotkey-list" :title="$t('title')" @close="$emit('close')">
    <div class="sections">
      <section
        v-for="(combinations, title) in hotkeys"
        :key="title"
        class="group"
      >
        <h4>{{ title }}</h4>
        <table>
          <thead>
            <tr>
              <th>{{ $t("combo") }}</th>
              <th>{{ $t("description") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(description, keys) in Object.fromEntries(combinations)"
              :key="keys"
            >
              <td>
                <kbd class="combo">
                  <template v-for="(key, index) in keys.split('+')" :key="key">
                    <span v-if="index !== 0" class="separator">+</span>
                    <kbd class="key">{{
                      $te(`keys.${key}`) ? $t(`keys.${key}`) : key
                    }}</kbd>
                  </template>
                </kbd>
              </td>
              <td>{{ description }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
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
  .sections {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 2em;
    color: $white;
  }

  th,
  td {
    padding: 0.5em 1em 0.5em 0;
  }

  th {
    font-weight: normal;
    border-bottom: 2px solid $white;
    white-space: nowrap;
  }

  td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  }

  kbd {
    font-family: inherit;
    font-weight: 600;

    &.key {
      display: inline-block;
      padding: 0.25em 0.5em;
      color: $black;
      line-height: 1em;
      text-align: center;
      background: $white;
      border: 1px solid $lightgray;
      border-radius: 0.25em;
      box-shadow: 1px 1px 1px $darkgray;

      &:first-letter {
        text-transform: uppercase;
      }
    }

    .separator {
      margin: 0 0.5em;
    }
  }
}
</style>
