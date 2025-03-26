<i18n>
{
  "fr": {
    "terms_placeholder": "Filtrer",
    "animated_label": "Animé",
    "static_label": "Fixe"
  },
  "en": {
    "terms_placeholder": "Filter",
    "animated_label": "Animated",
    "static_label": "Static"
  }
}
</i18n>

<template>
  <div class="shared-assets-toolbar">
    <form-group class="terms">
      <input v-model="filters.terms" :placeholder="$t('terms_placeholder')" />
    </form-group>

    <base-button
      v-for="(value, key) in tags"
      :key="key"
      :class="['tag', { active: isTagActive(key) }]"
      type="button"
      @click="toggleTag(key)"
    >
      {{ $t(value.label) }}
    </base-button>
  </div>
</template>

<script>
import useStore from "../store";

export default {
  props: {
    tags: {
      type: Object,
      default() {
        return {
          animated: {
            label: "animated_label",
            active: true,
          },
          static: {
            label: "static_label",
            active: true,
          },
        };
      },
    },
  },
  emits: ["change"],
  setup() {
    const store = useStore();
    return { store };
  },
  computed: {
    filters() {
      return this.store.filters;
    },
  },
  mounted() {
    Object.entries(this.tags).forEach(([key, value]) => {
      if (value.active) {
        this.filters.tags.push(key);
      }
    });
  },
  methods: {
    isTagActive(tag) {
      return this.filters.tags.includes(tag);
    },
    toggleTag(tag) {
      if (this.isTagActive(tag)) {
        this.filters.tags = this.filters.tags.filter((t) => t !== tag);
      } else {
        this.filters.tags.push(tag);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.shared-assets-toolbar {
  display: flex;
  height: 100%;
  flex-direction: row;
  align-items: center;

  .terms {
    flex: 1;
    max-width: 30em;
    min-width: 10em;
    margin: 0;

    :deep(input) {
      // #\9 is used here to increase specificity.
      &:not(#\9) {
        padding: 0.25em 0 0.25em 2em;
        background-color: var(--metascore-color-bg-tertiary);
        background-image: url(../assets/icons/search.svg);
        background-size: 1em;
        background-position: 0.5em 50%;
        background-repeat: no-repeat;
        border-radius: 1.5em;
      }
    }
  }

  .tag {
    min-width: 5em;
    padding: 0.25em 0.75em;
    margin-left: 1em;
    align-items: center;
    justify-content: center;
    background: none;
    color: var(--metascore-color-white);
    border: 1px solid var(--metascore-color-white);
    border-radius: 1.5em;
    opacity: 1;

    &.active {
      color: var(--metascore-color-bg-tertiary);
      background: var(--metascore-color-white);
    }

    &:hover {
      opacity: 0.75;
    }
  }
}
</style>
