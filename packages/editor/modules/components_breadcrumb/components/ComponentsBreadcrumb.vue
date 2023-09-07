<i18n>
{
  "fr": {
    "multi_selection_tail": "{count} composants"
  },
  "en": {
    "multi_selection_tail": "{count} components"
  },
}
</i18n>

<template>
  <nav
    v-show="items.length > 0"
    aria-label="breadcrumb"
    class="components-breadcrumb"
  >
    <ol>
      <components-breadcrumb-item
        v-for="(item, index) in items"
        :key="index"
        :type="item.type"
        :value="item.value"
        :tail="index === items.length - 1"
      />
    </ol>
  </nav>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";
import ComponentsBreadcrumbItem from "./ComponentsBreadcrumbItem.vue";

export default {
  components: {
    ComponentsBreadcrumbItem,
  },
  setup() {
    const { getComponentParent } = useModule("app_components");
    const { selectedComponents } = useModule("app_preview");
    return { getComponentParent, selectedComponents };
  },
  computed: {
    items() {
      const selected_components = this.selectedComponents;

      if (selected_components.length === 0) {
        return [];
      }

      const selection_anscestors = [];
      selected_components.forEach((component) => {
        const anscestors = [];
        let anscestor = component;

        while (anscestor) {
          anscestors.unshift(anscestor);
          anscestor = this.getComponentParent(anscestor);
        }
        selection_anscestors.push(anscestors);
      });

      selection_anscestors.sort((a, b) => {
        if (a.length > b.length) return -1;
        if (a.length < b.length) return 1;
        return 0;
      });

      if (selection_anscestors.length === 1) {
        return selection_anscestors[0].map((anscestor) => {
          return { type: "component", value: anscestor };
        });
      }

      const items = [];
      const master = selection_anscestors.pop();

      if (master.length > 1) {
        master.every((anscestor, index) => {
          const match = selection_anscestors.every((anscestors) => {
            console.log(anscestors, index);
            return (
              anscestors[index].type === anscestor.type &&
              anscestors[index].id === anscestor.id
            );
          });
          if (match) {
            items.push({ type: "component", value: anscestor });
            return true;
          }

          return false;
        });

        const ellipsis =
          master.length !== items.length + 1 ||
          selection_anscestors.some((anscestors) => {
            return anscestors.length !== master.length;
          });

        if (ellipsis) {
          items.push({ type: "text", value: "..." });
        }
      }

      items.push({
        type: "text",
        value: this.$t("multi_selection_tail", {
          count: selected_components.length,
        }),
      });

      return items;
    },
  },
};
</script>

<style lang="scss" scoped>
.components-breadcrumb {
  ol {
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0.25em 0.5em;
    list-style: none;
    background: var(--metascore-color-bg-secondary);
    user-select: none;
  }
}
</style>
