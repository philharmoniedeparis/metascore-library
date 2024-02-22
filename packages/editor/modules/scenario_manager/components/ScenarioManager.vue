<i18n>
{
  "fr": {
    "add_button_title": "Ajouter un nouveau scénario",
    "clone_button_title": "Dupliquer le scénario actif",
    "delete_button_title": "Supprimer le scénario actif",
    "delete_text": "Êtes-vous sûr de vouloir supprimer le scénario <em>{name}</em>\xa0?",
    "contextmenu": {
      "move_right": "Déplacer vers la droite",
      "move_left": "Déplacer vers la gauche",
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
      "move_right": "Move right",
      "move_left": "Move left",
      "clone": "Clone",
      "delete": "Delete",
    },
  },
}
</i18n>

<template>
  <div class="scenario-manager">
    <base-button
      type="button"
      class="scroll-left"
      :disabled="!canScrollLeft"
      @click="onScrollLeftClick"
    >
      <template #icon><arrow-icon /></template>
    </base-button>

    <base-button
      type="button"
      class="scroll-right"
      :disabled="!canScrollRight"
      @click="onScrollRightClick"
    >
      <template #icon><arrow-icon /></template>
    </base-button>

    <ol ref="list" class="list" @scroll="onListScroll">
      <li
        v-for="(scenario, index) in scenarios"
        :key="scenario.id"
        :data-id="scenario.id"
        :class="['item', { active: activeScenarioId === scenario.id }]"
        @contextmenu="onContextmenu(scenario, index)"
      >
        <button type="button" @click.prevent="onItemClick(scenario)">
          {{ scenario.name }}
        </button>
      </li>
    </ol>

    <base-button
      type="button"
      class="add"
      :title="$t('add_button_title')"
      @click="showAddForm = true"
    >
      <template #icon><add-icon /></template>
    </base-button>
    <add-form
      v-if="showAddForm"
      @submit="onAddSubmit"
      @close="showAddForm = false"
    />

    <base-button
      type="button"
      class="clone"
      :title="$t('clone_button_title')"
      @click="showCloneForm = true"
    >
      <template #icon><clone-icon /></template>
    </base-button>
    <clone-form
      v-if="showCloneForm"
      :name="activeName"
      @submit="onCloneSubmit"
      @close="showCloneForm = false"
    />

    <base-button
      type="button"
      class="delete"
      :title="$t('delete_button_title')"
      :disabled="scenariosCount <= 1"
      @click="showDeleteConfirm = true"
    >
      <template #icon><delete-icon /></template>
    </base-button>
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
import Sortable from "sortablejs";
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
  setup() {
    const {
      getSortedScenarios,
      activeScenario,
      setActiveScenario,
      createComponent,
      addComponent,
      setScenarioIndex,
      deleteComponent,
      cloneComponent,
    } = useModule("app_components");
    const { addItems: addContextmenuItems } = useModule("contextmenu");
    return {
      getSortedScenarios,
      activeScenarioId: activeScenario,
      setActiveScenario,
      createComponent,
      addComponent,
      setScenarioIndex,
      deleteComponent,
      cloneComponent,
      addContextmenuItems,
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
    scenarios() {
      return this.getSortedScenarios();
    },
    scenariosCount() {
      return this.scenarios.length;
    },
    activeScenario() {
      return this.getScenarioById(this.contextmenuId || this.activeScenarioId);
    },
    activeName() {
      return this.activeScenario?.name;
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
    this._sortable = new Sortable(this.$refs.list, {
      handle: ".active button",
      onEnd: this.onSortableEnd,
    });

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
    if (this._sortable) {
      this._sortable.destroy();
    }

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
      this.setActiveScenario(scenario.id);
    },
    onSortableEnd(evt) {
      const { item, oldIndex, newIndex } = evt;
      if (oldIndex === newIndex) return;

      const scenario = this.getScenarioById(item.dataset.id);
      this.setScenarioIndex(scenario, newIndex);
    },
    async onAddSubmit(data) {
      this.showAddForm = false;

      const scenario = await this.createComponent({
        ...data,
        type: "Scenario",
      });
      await this.addComponent(scenario);
      this.setActiveScenario(scenario.id);
    },
    async onCloneSubmit(data) {
      this.showCloneForm = false;

      const clone = await this.cloneComponent(this.activeScenario, data);
      this.setActiveScenario(clone.id);
    },
    async onDeleteSubmit() {
      this.showDeleteConfirm = false;

      await this.deleteComponent(this.activeScenario);
      this.setActiveScenario(this.scenarios[0].id);
    },
    onContextmenu(scenario, index) {
      const items = [];

      if (this.scenariosCount > 1) {
        if (index < this.scenariosCount - 1) {
          items.push({
            label: this.$t("contextmenu.move_right"),
            handler: () => {
              this.setScenarioIndex(scenario, index + 1);
            },
          });
        }

        if (index > 0) {
          items.push({
            label: this.$t("contextmenu.move_left"),
            handler: () => {
              this.setScenarioIndex(scenario, index - 1);
            },
          });
        }
      }

      items.push({
        label: this.$t("contextmenu.clone"),
        handler: () => {
          this.contextmenuId = scenario.id;
          this.showCloneForm = true;
        },
      });

      if (this.scenariosCount > 1) {
        items.push({
          label: this.$t("contextmenu.delete"),
          handler: () => {
            this.contextmenuId = scenario.id;
            this.showDeleteConfirm = true;
          },
        });
      }

      this.addContextmenuItems(items);
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
  font-size: 0.8em;
  overflow: hidden;
  user-select: none;

  button {
    &.scroll-left,
    &.scroll-right {
      font-size: 0.75em;
    }

    &.scroll-left {
      :deep(.icon) {
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
      border-right: 1px solid var(--metascore-color-bg-tertiary);
      border-left: 1px solid var(--metascore-color-bg-tertiary);
      white-space: nowrap;

      button {
        color: var(--metascore-color-text-primary);
        background: none;
        border: none;
        border-bottom: 1px solid transparent;
        opacity: 0.5;
      }

      &.active {
        button {
          border-bottom-color: var(--metascore-color-text-primary);
          opacity: 1;
          cursor: move;
        }
      }
    }
  }
}
</style>
