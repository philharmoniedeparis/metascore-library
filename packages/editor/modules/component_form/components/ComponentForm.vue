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
    "Animation": {
      "start-frame": "Image de départ",
      "loop-duration": "Durée d'un boucle",
      "reversed": "Inversé",
      "colors": "Couleurs",
    },
    "Block": {
      "pager-visibility": "Visibilité du tourne page",
    },
    "BlockToggler": {
      "blocks": "Blocs",
    },
    "Content": {
      "text": "Éditer le contenu",
    },
    "Cursor": {
      "form": "Forme",
      "direction": "Direction",
      "acceleration": "Accélération",
      "keyframes": "Enregistrer les positions",
      "start-angle": "Angle de départ",
      "loop-duration": "Durée d'un boucle",
      "cursor-width": "Largeur du curseur",
      "cursor-color": "Couleur du curseur",
    },
    "SVG": {
      "stroke": "Couleur du trait",
      "stroke-width": "Largeur du trait",
      "stroke-dasharray": "Style de trait",
      "fill": "Couleur de remplissage",
      "marker-start": "Marqueur de début",
      "marker-mid": "Marqueurs intermédiaires",
      "marker-end": "Marqueur de fin",
      "colors": "Couleurs",
    },
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
    "Animation": {
      "start-frame": "Start frame",
      "loop-duration": "Loop duration",
      "reversed": "Reversed",
      "colors": "Colors",
    },
    "Block": {
      "pager-visibility": "Pager visibility",
    },
    "BlockToggler": {
      "blocks": "Blocks",
    },
    "Content": {
      "text": "Edit the content",
    },
    "Cursor": {
      "form": "Form",
      "direction": "Direction",
      "acceleration": "Acceleration",
      "keyframes": "Record positions",
      "start-angle": "Start angle",
      "loop-duration": "Loop duration",
      "cursor-width": "Cursor width",
      "cursor-color": "Cursor color",
    },
    "SVG": {
      "stroke": "Stroke color",
      "stroke-width": "Stroke width",
      "stroke-dasharray": "Stroke style",
      "fill": "Fill color",
      "marker-start": "Marker start",
      "marker-mid": "Marker mid",
      "marker-end": "Marker end",
      "colors": "Colors",
    },
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
    commonModelType() {
      return this.commonModelClass?.type;
    },
    title() {
      return this.commonModelType;
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

      ["name", "hidden", "background-color", "background-image"].forEach(
        (property) => {
          layout.items[0].items.push({
            property,
            label: property === "name" ? null : this.$t(property),
          });
        }
      );

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
                label: this.$t(`Animation.${property}`),
              });
            }
          );
          break;

        case "Block":
          layout.items[0].items.push({
            property: "pager-visibility",
            label: this.$t("Block.pager-visibility"),
          });
          break;

        case "BlockToggler":
          layout.items[0].items.push({
            property: "blocks",
            label: this.$t("BlockToggler.blocks"),
          });
          break;

        case "Content":
          layout.items[0].items.push({
            property: "text",
            label: this.$t("Content.text"),
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
              label: this.$t(`Cursor.${property}`),
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
              label: this.$t(`SVG.${property}`),
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
      if (animated.length > 0) {
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

    &.checkbox {
      .input-wrapper {
        label {
          order: -1;
        }
      }
    }

    &[data-property="name"] {
      label {
        @include sr-only;
      }
    }
  }
}
</style>
