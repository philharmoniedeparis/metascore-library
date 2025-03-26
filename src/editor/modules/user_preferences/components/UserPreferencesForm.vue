<i18n>
{
  "fr": {
    "title": "Paramètres",
    "workspace": {
      "group_label": "Espace de travail",
      "grid_color": {
        "label": "Couleur de la grille",
        "description": "La couleur des lignes de la grille"
      },
      "grid_step": {
        "label": "Pas de la grille",
        "description": "La distance entre chaque ligne de la grille en pixels"
      },
      "snap_to_grid": {
        "label": "Magnétisme à la grille",
        "description": "Activation ou non du magnétisme des composants à la grille"
      },
      "snap_to_siblings": {
        "label": "Magnétisme aux composants",
        "description": "Activation ou non du magnétisme des composants aux autres composants"
      },
      "snap_range": {
        "label": "Portée du magnétisme",
        "description": "La distance à laquelle un accrochage à une cible (grille ou composant) est possible"
      }
    },
    "apply_button": "Appliquer",
    "cancel_button": "Annuler"
  },
  "en": {
    "title": "Settings",
    "workspace": {
      "group_label": "Workspace",
      "grid_color": {
        "label": "Grid color",
        "description": "The color of grid lines"
      },
      "grid_step": {
        "label": "Grid step",
        "description": "The distance between each grid line in pixels"
      },
      "snap_to_grid": {
        "label": "Snapping to grid",
        "description": "Whether to activate component drag snapping to the grid"
      },
      "snap_to_siblings": {
        "label": "Snapping to components",
        "description": "Whether to activate component drag snapping to other components"
      },
      "snap_range": {
        "label": "Snap range",
        "description": "The distance at which a snap to a target (grid or component) is possible"
      }
    },
    "apply_button": "Apply",
    "cancel_button": "Cancel"
  }
}
</i18n>

<template>
  <modal-form
    :title="$t('title')"
    :validate="false"
    @submit="onSubmit"
    @close="onCancel"
  >
    <schema-form
      v-if="model"
      class="user-preferences-form"
      :schema="schema"
      :layout="layout"
      :values="model.data"
      :validator="validator"
      :errors="errors"
      @update:model-value="onUpdate($event)"
    />

    <template #actions="props">
      <base-button :form="props.form" role="primary">
        {{ $t("apply_button") }}
      </base-button>

      <base-button
        type="button"
        :form="props.form"
        role="secondary"
        @click="onCancel"
      >
        {{ $t("cancel_button") }}
      </base-button>
    </template>
  </modal-form>
</template>

<script>
import useStore from "../store";
import Model from "../models/UserPreferences";

export default {
  emits: ["submit", "close"],
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      model: null,
      errors: null,
    };
  },
  computed: {
    data: {
      get() {
        return this.store.data;
      },
      set(value) {
        this.store.data = value;
      },
    },
    schema() {
      return this.model.schema;
    },
    validator() {
      return this.model.ajv;
    },
    layout() {
      return {
        type: "markup",
        items: [
          {
            type: "markup",
            tag: "fieldset",
            items: [
              {
                type: "markup",
                tag: "legend",
                content: this.$t("workspace.group_label"),
              },
              {
                property: "workspace.grid-color",
                label: this.$t("workspace.grid_color.label"),
                description: this.$t("workspace.grid_color.description"),
              },
              {
                property: "workspace.grid-step",
                label: this.$t("workspace.grid_step.label"),
                description: this.$t("workspace.grid_step.description"),
                suffix: "px",
              },
              {
                property: "workspace.snap-to-grid",
                label: this.$t("workspace.snap_to_grid.label"),
                description: this.$t("workspace.snap_to_grid.description"),
              },
              {
                property: "workspace.snap-to-siblings",
                label: this.$t("workspace.snap_to_siblings.label"),
                description: this.$t("workspace.snap_to_siblings.description"),
              },
              {
                property: "workspace.snap-range",
                label: this.$t("workspace.snap_range.label"),
                description: this.$t("workspace.snap_range.description"),
                suffix: "px",
              },
            ],
          },
        ],
      };
    },
  },
  async mounted() {
    this.model = await Model.create(this.data);
  },
  methods: {
    onUpdate({ property, value }) {
      this.model.update({ [property]: value }, false);
    },
    async onSubmit() {
      this.errors = null;

      try {
        this.data = await this.model.validate(this.model.data);
        this.store.save();
        this.$emit("submit", this.data);
      } catch (errors) {
        this.errors = errors;
      }
    },
    onCancel() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.user-preferences-form {
  :deep(fieldset) {
    display: flex;
    margin-bottom: 0.5em;
    padding: 0 1em;
    flex-direction: column;
    gap: 0.5em;
    border: 1px solid var(--metascore-color-bg-tertiary);

    > legend {
      display: inline-block;
      width: auto;
      padding: 0.25em 0.5em;
      color: var(--metascore-color-white);
      text-align: left;
    }

    .form-group.number {
      input {
        width: 4em;
      }
    }
  }
}
</style>
