<i18n>
{
  "fr": {
    "add_button_title": "Ajouter un nouveau scénario",
    "clone_button_title": "Dupliquer le scénario actif",
  },
  "en": {
    "add_button_title": "Add a new scenario",
    "clone_button_title": "Clone the active scenario",
  },
}
</i18n>

<template>
  <div class="scenario-manager">
    <styled-button
      type="button"
      class="previous"
      :disabled="!hasPrevious"
      @click="onPreviousClick"
    >
      <template #icon><arrow-icon /></template>
    </styled-button>

    <styled-button
      type="button"
      class="next"
      :disabled="!hasNext"
      @click="onNextClick"
    >
      <template #icon><arrow-icon /></template>
    </styled-button>

    <ul class="list">
      <li
        v-for="scenario in scenarios"
        :key="scenario.id"
        :class="['item', { active: active === scenario.id }]"
      >
        <a href="#" @click.prevent="onItemClick(scenario)">
          {{ scenario.name }}
        </a>
      </li>
    </ul>

    <styled-button
      type="button"
      class="add"
      :title="$t('add_button_title')"
      @click="showAddForm = true"
    >
      <template #icon><add-icon /></template>
    </styled-button>
    <add-form
      v-if="showAddForm"
      @submit="onAddFormSubmit"
      @close="showAddForm = false"
    />

    <styled-button
      type="button"
      class="clone"
      :title="$t('clone_button_title')"
      @click="showCloneForm = true"
    >
      <template #icon><clone-icon /></template>
    </styled-button>
    <clone-form
      v-if="showCloneForm"
      @submit="onCloneFormSubmit"
      @close="showCloneForm = false"
    />
  </div>
</template>

<script>
import ArrowIcon from "../assets/icons/arrow.svg?inline";
import AddIcon from "../assets/icons/add.svg?inline";
import AddForm from "./AddForm.vue";
import CloneIcon from "../assets/icons/clone.svg?inline";
import CloneForm from "./CloneForm.vue";

export default {
  components: {
    ArrowIcon,
    AddIcon,
    AddForm,
    CloneIcon,
    CloneForm,
  },
  props: {
    scenarios: {
      type: Array,
      required: true,
    },
    active: {
      type: String,
      default: null,
    },
  },
  emits: ["update:active", "add", "clone"],
  data() {
    return {
      showAddForm: false,
      showCloneForm: false,
    };
  },
  computed: {
    activeIndex() {
      return this.scenarios.findIndex((s) => s.id === this.active);
    },
    hasPrevious() {
      return this.activeIndex > 0;
    },
    hasNext() {
      return (
        this.activeIndex > -1 && this.activeIndex < this.scenarios.length - 1
      );
    },
  },
  methods: {
    onPreviousClick() {
      const scenario = this.scenarios[this.activeIndex - 1];
      this.$emit("update:active", scenario.id);
    },
    onNextClick() {
      const scenario = this.scenarios[this.activeIndex + 1];
      this.$emit("update:active", scenario.id);
    },
    onItemClick(scenario) {
      this.$emit("update:active", scenario.id);
    },
    onAddFormSubmit(data) {
      this.showAddForm = false;
      this.$emit("add", data);
    },
    onCloneFormSubmit(data) {
      this.showCloneForm = false;
      this.$emit("clone", {
        ...data,
        id: this.active,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.scenario-manager {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 0.25em;
  font-size: 0.75em;
  overflow: hidden;

  button {
    color: $white;

    &.previous,
    &.next {
      font-size: 0.75em;
    }

    &.previous {
      ::v-deep(.icon) {
        transform: rotate(180deg);
      }
    }
  }

  .list {
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow: hidden;
    scroll-behavior: smooth;

    .item {
      padding: 0 0.5em;
      border-right: 1px solid $darkgray;
      border-left: 1px solid $darkgray;
      white-space: nowrap;
      opacity: 0.5;

      a {
        color: $white;
        border-bottom: 1px solid transparent;
      }

      &.active {
        opacity: 1;

        a {
          border-bottom-color: $white;
          cursor: default;
        }
      }
    }
  }
}
</style>
