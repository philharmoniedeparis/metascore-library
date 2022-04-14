<i18n>
{
  "fr": {
    "add_button_title": "Ajouter un nouveau scénario",
    "clone_button_title": "Dupliquer le scénario actif",
    "delete_button_title": "Supprimer le scénario actif",
    "delete_text": "Êtes-vous sûr de vouloir supprimer le scénario <em>{name}</em>\xa0?",
    "contextmenu": {
      "clone": "Dupliquer",
      "delete": "Supprimer",
    },
  },
  "en": {
    "add_button_title": "Add a new scenario",
    "clone_button_title": "Clone the active scenario",
    "delete_button_title": "Delete the active scenario",
    "delete_text": "Are you sure you want to delete the scenario <em>{name}</em>?",
    "contextmenu": {
      "clone": "Clone",
      "delete": "Delete",
    },
  },
}
</i18n>

<template>
  <div class="scenario-manager">
    <styled-button
      type="button"
      class="scroll-left"
      :disabled="!canScrollLeft"
      @click="onScrollLeftClick"
    >
      <template #icon><arrow-icon /></template>
    </styled-button>

    <styled-button
      type="button"
      class="scroll-right"
      :disabled="!canScrollRight"
      @click="onScrollRightClick"
    >
      <template #icon><arrow-icon /></template>
    </styled-button>

    <ul ref="list" class="list" @scroll="onListScroll">
      <li
        v-for="scenario in scenarios"
        :key="scenario.id"
        :class="['item', { active: activeId === scenario.id }]"
        @contextmenu="onContextmenu(scenario)"
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
      @submit="onAddSubmit"
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
      :name="activeName"
      @submit="onCloneSubmit"
      @close="showCloneForm = false"
    />

    <styled-button
      type="button"
      class="delete"
      :title="$t('delete_button_title')"
      :disabled="scenariosCount <= 1"
      @click="showDeleteConfirm = true"
    >
      <template #icon><delete-icon /></template>
    </styled-button>
    <confirm-dialog
      v-if="showDeleteConfirm"
      @submit="onDeleteSubmit"
      @cancel="showDeleteConfirm = false"
    >
      <p v-dompurify-html="$t('delete_text', { name: activeName })"></p>
    </confirm-dialog>
  </div>
</template>

<script>
import { debounce } from "lodash";
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import { useModule } from "@metascore-library/core/services/module-manager";
import ArrowIcon from "../assets/icons/arrow.svg?inline";
import AddIcon from "../assets/icons/add.svg?inline";
import AddForm from "./AddForm.vue";
import CloneIcon from "../assets/icons/clone.svg?inline";
import CloneForm from "./CloneForm.vue";
import DeleteIcon from "../assets/icons/delete.svg?inline";

export default {
  components: {
    ArrowIcon,
    AddIcon,
    AddForm,
    CloneIcon,
    CloneForm,
    DeleteIcon,
  },
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  props: {
    scenarios: {
      type: Array,
      required: true,
    },
    activeId: {
      type: String,
      default: null,
    },
  },
  emits: ["update:activeId", "add", "clone", "delete"],
  setup() {
    const contextmenuStore = useModule("contextmenu").useStore();
    return {
      contextmenuStore,
    };
  },
  data() {
    return {
      listWidth: null,
      listScrollWidth: null,
      listScrollLeft: 0,
      showAddForm: false,
      showCloneForm: false,
      showDeleteConfirm: false,
      contextmenuId: null,
    };
  },
  computed: {
    canScrollLeft() {
      return this.listScrollLeft > 0;
    },
    canScrollRight() {
      return this.listScrollLeft < this.listScrollWidth - this.listWidth;
    },
    scenariosCount() {
      return this.scenarios.length;
    },
    active() {
      return this.getScenarioById(this.contextmenuId || this.activeId);
    },
    activeName() {
      return this.active?.name;
    },
  },
  watch: {
    scenariosCount() {
      this.updateListWidths();
    },
    showCloneForm(value) {
      if (!value) {
        this.contextmenuId = null;
      }
    },
    showDeleteConfirm(value) {
      if (!value) {
        this.contextmenuId = null;
      }
    },
  },
  mounted() {
    this.$nextTick(function () {
      this._resize_observer = new ResizeObserver(
        debounce(() => {
          this.updateListWidths();
        }, 500)
      );
      this._resize_observer.observe(this.$refs.list);

      this.updateListWidths();
    });
  },
  beforeUnmount() {
    if (this._resize_observer) {
      this._resize_observer.disconnect();
    }
  },
  methods: {
    getScenarioById(id) {
      return this.scenarios.find((s) => s.id === id);
    },
    updateListWidths() {
      this.$nextTick(function () {
        this.listWidth = this.$refs.list.clientWidth;
        this.listScrollWidth = this.$refs.list.scrollWidth;
      });
    },
    onListScroll(evt) {
      this.listScrollLeft = evt.target.scrollLeft;
    },
    onScrollLeftClick() {
      const list = this.$refs.list;
      const items = list.querySelectorAll(".item");
      for (let i = 1; i < items.length; i++) {
        const item = items[i];
        if (item.offsetLeft >= list.scrollLeft) {
          items[i - 1].scrollIntoView();
          return;
        }
      }

      list.scrollLeft = 0;
    },
    onScrollRightClick() {
      const list = this.$refs.list;
      const items = list.querySelectorAll(".item");
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.offsetLeft > list.scrollLeft + list.clientWidth) {
          item.scrollIntoView();
          return;
        }
      }

      list.scrollLeft = list.scrollWidth - list.clientWidth;
    },
    onItemClick(scenario) {
      this.$emit("update:activeId", scenario.id);
    },
    onAddSubmit(data) {
      this.showAddForm = false;
      this.$emit("add", data);
    },
    onCloneSubmit(data) {
      this.showCloneForm = false;
      this.$emit("clone", {
        scenario: this.active,
        data,
      });
    },
    onDeleteSubmit() {
      this.showDeleteConfirm = false;
      this.$emit("delete", {
        scenario: this.active,
      });
    },
    onContextmenu(scenario) {
      const items = [
        {
          label: this.$t("contextmenu.clone"),
          handler: () => {
            this.contextmenuId = scenario.id;
            this.showCloneForm = true;
          },
        },
      ];

      if (this.scenariosCount > 1) {
        items.push({
          label: this.$t("contextmenu.delete"),
          handler: () => {
            this.contextmenuId = scenario.id;
            this.showDeleteConfirm = true;
          },
        });
      }

      this.contextmenuStore.addItems(items);
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
  user-select: none;

  button {
    &.scroll-left,
    &.scroll-right {
      font-size: 0.75em;
    }

    &.scroll-left {
      ::v-deep(.icon) {
        transform: rotate(180deg);
      }
    }
  }

  .list {
    position: relative;
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

      a {
        color: $white;
        border-bottom: 1px solid transparent;
        opacity: 0.5;
      }

      &.active {
        a {
          border-bottom-color: $white;
          opacity: 1;
          cursor: default;
        }
      }
    }
  }
}
</style>
