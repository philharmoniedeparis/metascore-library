<i18n>
{
  "fr": {
    "name": "Nom",
    "hidden": "Caché au démarrage",
    "background-color": "Couleur de fond",
    "background-image": "Image de fond",
    "border": "Bordure",
    "border-radius": "Rayon",
    "position": "Position",
    "dimension": "Dimension",
    "start-time": "Début",
    "end-time": "Fin",
    "opacity": "Opacité",
    "translate": "Translation",
    "scale": "Échelle",
  },
  "en": {
    "name": "Name",
    "hidden": "Hidden on start",
    "background-color": "Background color",
    "background-image": "Background image",
    "border": "Border",
    "border-radius": "Radius",
    "position": "Position",
    "dimension": "Dimension",
    "start-time": "Start",
    "end-time": "End",
    "opacity": "Opacity",
    "translate": "Translation",
    "scale": "Scale",
  },
}
</i18n>

<template>
  <div v-if="masterModel" class="component-form">
    <h2 class="title">{{ title }}</h2>
    <schema-form
      :schema="schema"
      :layout="layout"
      :values="masterModel"
      :validator="validator"
      @update:model-value="update($event)"
    />
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/services/module-manager";
import { intersection } from "lodash";

export default {
  setup() {
    const editorStore = useStore("editor");
    return { editorStore };
  },
  computed: {
    selectedComponents() {
      return this.editorStore.getSelectedComponents;
    },
    masterModel() {
      return this.selectedComponents[0];
    },
    validator() {
      return this.masterModel?.$ajv;
    },
    commonModelClasses() {
      let commonClasses = [];
      this.selectedComponents.forEach((model, index) => {
        const modelChain = model.$modelChain;
        commonClasses =
          index > 0 ? intersection(commonClasses, modelChain) : modelChain;
      });
      return commonClasses;
    },
    commonModelClass() {
      return this.commonModelClasses[0];
    },
    commonModelTypes() {
      return this.commonModelClasses.map((c) => c.type);
    },
    title() {
      return this.commonModelClass?.type;
    },
    schema() {
      return this.commonModelClass?.schema;
    },
    layout() {
      const layout = {
        type: "markup",
        items: [
          {
            type: "markup",
            class: "form-container vertical",
            items: [],
          },
        ],
      };

      if (this.commonModelTypes.includes("AbstractComponent")) {
        layout.items[0].items.push({
          property: "name",
        });
      }

      if (this.commonModelClass.$isHideable) {
        layout.items[0].items.push({
          property: "hidden",
          label: this.$t("hidden"),
        });
      }

      if (this.commonModelClass.$isBackgroundable) {
        ["background-color", "background-image"].forEach((property) => {
          layout.items[0].items.push({
            property,
            label: this.$t(property),
          });
        });
      }

      if (this.commonModelClass.$isBorderable) {
        layout.items[0].items.push({
          type: "markup",
          class: "form-container horizontal",
          items: [
            {
              property: "border-color",
              label: this.$t("border"),
            },
            {
              property: "border-width",
              label: null,
            },
            {
              property: "border-radius",
              label: this.$t("border-radius"),
            },
          ],
        });
      }

      if (this.commonModelClass.$isPositionable) {
        layout.items[0].items.push({
          property: "position",
          label: this.$t("position"),
        });
      }

      if (this.commonModelClass.$isResizable) {
        layout.items[0].items.push({
          property: "dimension",
          label: this.$t("dimension"),
        });
      }

      switch (this.commonModelType) {
        case "Animation":
          ["start-frame", "loop-duration", "reversed", "colors"].forEach(
            (property) => {
              layout.items[0].items.push({
                property,
                label: this.$t(property),
              });
            }
          );
          break;

        case "Block":
          ["synched", "pager-visibility"].forEach((property) => {
            layout.items[0].items.push({
              property,
              label: this.$t(property),
            });
          });
          break;

        case "BlockToggler":
          layout.items[0].items.push({
            property: "blocks",
            label: this.$t("blocks"),
          });
          break;

        case "Content":
          layout.items[0].items.push({
            property: "text",
            label: this.$t("text"),
          });
          break;

        case "Cursor":
          [
            "form",
            "direction",
            "acceleration",
            "cursor-width",
            "cursor-color",
            "keyframes",
            "start-angle",
            "loop-duration",
          ].forEach((property) => {
            layout.items[0].items.push({
              property,
              label: this.$t(property),
            });
          });
          break;

        case "SVG":
          [
            "stroke",
            "stroke-width",
            "stroke-dasharray",
            "fill",
            "marker-start",
            "marker-mid",
            "marker-end",
            "colors",
          ].forEach((property) => {
            layout.items[0].items.push({
              property,
              label: this.$t(property),
            });
          });
          break;
      }

      if (this.commonModelClass.$isTimeable) {
        layout.items.push({
          type: "markup",
          class: "form-container horizontal time",
          items: [
            {
              property: "start-time",
              label: this.$t("start-time"),
            },
            {
              property: "end-time",
              label: this.$t("end-time"),
            },
          ],
        });
      }

      if (
        this.commonModelClass.$isOpacitable ||
        this.commonModelClass.$isTransformable
      ) {
        const animated = [];

        if (this.commonModelClass.$isOpacitable) {
          animated.push({
            property: "opacity",
            label: this.$t("opacity"),
          });
        }
        if (this.commonModelClass.$isTransformable) {
          animated.push({
            property: "translate",
            label: this.$t("translate"),
          });
          animated.push({
            property: "scale",
            label: this.$t("scale"),
          });
        }

        layout.items.push({
          type: "markup",
          class: "form-container vertical animated",
          items: animated,
        });
      }

      return layout;
    },
  },
  methods: {
    update({ property, value }) {
      this.editorStore.updateComponents(this.selectedComponents, {
        [property]: value,
      });
    },
    getControlProps(property) {
      const props = {
        label: this.$t(property),
      };

      return props;
    },
  },
};
</script>

<style lang="scss" scoped>
.component-form {
  display: flex;
  height: 100%;
  flex-direction: column;
  background: $mediumgray;
  overflow: auto;
  color: $white;

  h2.title {
    position: sticky;
    top: 0;
    flex: 0 0 auto;
    margin: 0;
    padding: 0.5em;
    font-size: 1em;
    font-weight: normal;
    background: $lightgray;
    border-bottom: 0.25em solid $mediumgray;
    z-index: 1;
  }

  ::v-deep(.form-container) {
    display: flex;
    background: $lightgray;
    gap: 0.75em;
    padding: 0.5em;

    &.vertical {
      flex-direction: column;
    }

    &.horizontal {
      flex-direction: row;
      gap: 0.5em;
    }

    &.time {
      justify-content: space-between;
      border-top: 2px solid $mediumgray;
    }

    &.animated {
      display: grid;
      grid-template-columns: max-content max-content auto;
      grid-auto-flow: dense;
      gap: 0.5em;
      align-items: center;
      background: none;

      > .form-group {
        display: contents;

        > .input-wrapper {
          display: contents;

          > label {
            grid-column: 2/2;
          }
          > .form-group.checkbox {
            grid-column: 1/1;
          }
        }
      }

      input {
        &:not([type="checkbox"]):not([type="radio"]) {
          background: $lightgray;
        }
      }
    }

    .form-container {
      padding: 0;
    }
  }

  ::v-deep(.control) {
    margin: 0;

    .input-wrapper {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      flex: 1 1 auto;
    }

    label {
      flex: 0 0 auto;
    }

    input {
      min-width: 0;
      flex: 1;
    }

    &[data-property="name"] {
      label {
        @include sr-only;
      }
    }
  }
}
</style>
