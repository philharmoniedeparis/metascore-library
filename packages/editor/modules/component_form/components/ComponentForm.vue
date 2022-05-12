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
    "AbstractComponent": {
      "title": "Composant | {count} Composants"
    },
    "EmbeddableComponent": {
      "title": "Composant | {count} Composants"
    },
    "Animation": {
      "title": "Animation | {count} Animations",
      "start-frame": "Image de départ",
      "loop-duration": "Durée d'un boucle",
      "reversed": "Inversé",
      "colors": "Couleurs",
    },
    "Block": {
      "title": "Bloc | {count} Blocs",
      "pager-visibility": "Visibilité du tourne page",
    },
    "BlockToggler": {
      "title": "Contrôleur de blocs | {count} Contrôleurs de blocs",
      "blocks": "Blocs",
    },
    "Content": {
      "title": "Texte | {count} Textes",
      "text": "Éditer le contenu",
    },
    "Controller": {
      "title": "Contrôleur | {count} Contrôleurs",
    },
    "Cursor": {
      "title": "Curseur | {count} Curseurs",
      "form": "Forme",
      "direction": "Direction",
      "acceleration": "Accélération",
      "keyframes": "Enregistrer les positions",
      "start-angle": "Angle de départ",
      "loop-duration": "Durée d'un boucle",
      "cursor-width": "Largeur du curseur",
      "cursor-color": "Couleur du curseur",
    },
    "Media": {
      "title": "Média",
    },
    "Page": {
      "title": "Page {index}/{total} | {count} Pages",
    },
    "Scenario": {
      "title": "Scénario | {count} Scénarios",
    },
    "SVG": {
      "title": "SVG | {count} SVGs",
      "colors": "Couleurs",
      "stroke": "Couleur du trait",
      "stroke-width": "Largeur du trait",
      "stroke-dasharray": "Style de trait",
      "fill": "Couleur de remplissage",
      "marker-start": "Marqueur de début",
      "marker-mid": "Marqueurs intermédiaires",
      "marker-end": "Marqueur de fin",
    },
    "VideoRenderer": {
      "title": "Rendu vidéo | {count} Rendus vidéo",
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
    "AbstractComponent": {
      "title": "Component | {count} Components"
    },
    "EmbeddableComponent": {
      "title": "Component | {count} Components"
    },
    "Animation": {
      "title": "Animation | {count} Animations",
      "start-frame": "Start frame",
      "loop-duration": "Loop duration",
      "reversed": "Reversed",
      "colors": "Colors",
    },
    "Block": {
      "title": "Block | {count} Blocks",
      "pager-visibility": "Pager visibility",
    },
    "BlockToggler": {
      "title": "Block toggler | {count} Block togglers",
      "blocks": "Blocks",
    },
    "Content": {
      "title": "Text | {count} Texts",
      "text": "Edit the content",
    },
    "Controller": {
      "title": "Controller | {count} Controllers",
    },
    "Cursor": {
      "title": "Cursor | {count} Cursors",
      "form": "Form",
      "direction": "Direction",
      "acceleration": "Acceleration",
      "keyframes": "Record positions",
      "start-angle": "Start angle",
      "loop-duration": "Loop duration",
      "cursor-width": "Cursor width",
      "cursor-color": "Cursor color",
    },
    "Media": {
      "title": "Media | {count} Media",
    },
    "Page": {
      "title": "Page {index}/{total} | {count} Pages",
    },
    "Scenario": {
      "title": "Scenario | {count} Scenarios",
    },
    "SVG": {
      "title": "SVG | {count} SVGs",
      "stroke": "Stroke color",
      "stroke-width": "Stroke width",
      "stroke-dasharray": "Stroke style",
      "fill": "Fill color",
      "marker-start": "Marker start",
      "marker-mid": "Marker mid",
      "marker-end": "Marker end",
      "colors": "Colors",
    },
    "VideoRenderer": {
      "title": "Video Renderer | {count} Video Renderers",
    },
  },
}
</i18n>

<template>
  <div v-if="masterComponent" class="component-form">
    <h2 class="title">{{ title }}</h2>
    <schema-form
      :schema="schema"
      :layout="layout"
      :values="masterComponent"
      :validator="validator"
      @update:model-value="update($event)"
    />
  </div>
</template>

<script>
import { intersection } from "lodash";
import useStore from "../store";
import { useModule } from "@metascore-library/core/services/module-manager";

export default {
  props: {
    images: {
      type: Array,
      default() {
        return [];
      },
    },
    firstLevelComponents: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  setup() {
    const store = useStore();
    const {
      getModel,
      getComponentParent,
      getComponentChildren,
      updateComponent,
    } = useModule("app_components");
    const {
      iframe: appPreveiwIframe,
      selectedComponents,
      getComponentElement,
    } = useModule("app_preview");
    return {
      store,
      getModel,
      getComponentParent,
      getComponentChildren,
      updateComponent,
      appPreveiwIframe,
      getComponentElement,
      selectedComponents,
    };
  },
  computed: {
    selectedComponentsCount() {
      return this.selectedComponents.length;
    },
    masterComponent() {
      return this.selectedComponents[0];
    },
    commonModel() {
      let models = [];
      this.selectedComponents.forEach((component, index) => {
        const model = this.getModel(component.type);
        const modelChain = model.modelChain;
        models = index > 0 ? intersection(models, modelChain) : modelChain;
      });
      return models[0];
    },
    title() {
      const count = this.selectedComponentsCount;

      if (count === 1 && this.commonModel.type === "Page") {
        const block = this.getComponentParent(this.masterComponent);
        const pages = this.getComponentChildren(block);
        const total = pages.length;
        const index =
          pages.findIndex((c) => c.id === this.masterComponent.id) + 1;
        return this.$tc("Page.title", { index, total }, count);
      }

      return this.$tc(`${this.commonModel.type}.title`, count);
    },
    schema() {
      return this.commonModel?.schema;
    },
    validator() {
      return this.commonModel?.ajv;
    },
    layout() {
      if (!this.commonModel) {
        return;
      }

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

      ["name", "hidden"].forEach((property) => {
        layout.items[0].items.push({
          ...this.getControlProps(property),
        });
      });

      if (this.commonModel.$isBackgroundable) {
        layout.items[0].items.push({
          swatches: this.store.configs.colorSwatches,
          ...this.getControlProps("background-color"),
        });
        layout.items[0].items.push({
          type: "select",
          options: [{ name: "", id: -1, url: null }, ...this.images],
          optionLabel: (o) => o?.name,
          optionKey: (o) => o?.id,
          optionValue: (o) => o.url,
          ...this.getControlProps("background-image"),
        });
      }

      if (this.commonModel.$isBorderable) {
        layout.items[0].items.push({
          type: "markup",
          class: "form-container horizontal",
          items: [
            {
              swatches: this.store.configs.colorSwatches,
              ...this.getControlProps("border-color"),
            },
            ...["border-width", "border-radius"].map((property) =>
              this.getControlProps(property)
            ),
          ],
        });
      }

      if (this.commonModel.$isPositionable) {
        layout.items[0].items.push({
          itemProps: [
            { spinnersDirection: "horizontal" },
            { flipSpinners: true },
          ],
          ...this.getControlProps("position"),
        });
      }

      if (this.commonModel.$isResizable) {
        layout.items[0].items.push({
          itemProps: [
            { spinnersDirection: "horizontal" },
            { flipSpinners: true },
          ],
          ...this.getControlProps("dimension"),
        });
      }

      switch (this.commonModel.type) {
        case "Animation":
          ["start-frame", "loop-duration", "reversed"].forEach((property) => {
            layout.items[0].items.push({
              ...this.getControlProps(property, this.commonModel.type),
            });
          });
          layout.items[0].items.push({
            swatches: this.store.configs.colorSwatches,
            ...this.getControlProps("colors"),
          });
          break;

        case "Block":
          layout.items[0].items.push(
            this.getControlProps("pager-visibility", this.commonModel.type)
          );
          break;

        case "BlockToggler":
          layout.items[0].items.push({
            type: "select",
            multiple: true,
            options: this.firstLevelComponents,
            optionLabel: (o) => o?.name,
            optionKey: (o) => o?.id,
            optionValue: (o) => ({ type: o.type, id: o.id }),
            ...this.getControlProps("blocks", this.commonModel.type),
          });
          break;

        case "Content":
          if (this.selectedComponentsCount === 1) {
            layout.items[0].items.push({
              type: "html",
              "app-iframe-el": this.appPreveiwIframe,
              "app-component-el": this.getComponentElement(
                this.masterComponent
              ),
              ...this.getControlProps("text", this.commonModel.type),
            });
          }
          break;

        case "Cursor":
          [
            "form",
            "direction",
            "acceleration",
            "cursor-width",
            "cursor-color",
            "start-angle",
            "loop-duration",
          ].forEach((property) => {
            layout.items[0].items.push(
              this.getControlProps(property, this.commonModel.type)
            );
          });
          if (this.selectedComponentsCount === 1) {
            layout.items[0].items.push({
              type: "cursor-keyframes",
              "app-component-el": this.getComponentElement(
                this.masterComponent
              ),
              ...this.getControlProps("keyframes", this.commonModel.type),
            });
          }
          break;

        case "SVG":
          if (
            this.masterComponent.colors &&
            this.masterComponent.colors.length > 0
          ) {
            layout.items[0].items.push({
              itemProps: {
                swatches: this.store.configs.colorSwatches,
              },
              ...this.getControlProps("colors", this.commonModel.type),
            });
          } else {
            ["stroke", "stroke-width"].forEach((property) => {
              layout.items[0].items.push(
                this.getControlProps(property, this.commonModel.type)
              );
            });
            layout.items[0].items.push({
              type: "select",
              options: [
                { label: "—", value: null },
                { label: "···", value: "2,2" },
                { label: "···", value: "2,2" },
                { label: "- -", value: "5,5" },
                { label: "-·-", value: "5,2,2,2" },
                { label: "-··-", value: "5,2,2,2,2,2" },
              ],
              ...this.getControlProps(
                "stroke-dasharray",
                this.commonModel.type
              ),
            });
            layout.items[0].items.push(
              this.getControlProps("fill", this.commonModel.type)
            );

            if (
              this.masterComponent.markers &&
              this.masterComponent.markers.length > 0
            ) {
              ["marker-start", "marker-mid", "marker-end"].forEach(
                (property) => {
                  layout.items[0].items.push({
                    type: "select",
                    options: [null, ...this.masterComponent.markers],
                    ...this.getControlProps(property, this.commonModel.type),
                  });
                }
              );
            }
          }
          break;
      }

      if (this.commonModel.$isTimeable) {
        layout.items.push({
          type: "markup",
          class: "form-container horizontal time",
          items: [
            {
              inButton: true,
              outButton: true,
              clearButton: true,
              ...this.getControlProps("start-time"),
            },
            {
              inButton: true,
              outButton: true,
              clearButton: true,
              ...this.getControlProps("end-time"),
            },
          ],
        });
      }

      const animated = [];
      if (this.commonModel.$isOpacitable) {
        animated.push(this.getControlProps("opacity"));
      }
      if (this.commonModel.$isTransformable) {
        animated.push({
          itemProps: {
            value: {
              itemProps: [{ spinnersDirection: "horizontal" }, {}],
            },
          },
          ...this.getControlProps("scale"),
        });
        animated.push({
          itemProps: {
            value: {
              itemProps: [
                { spinnersDirection: "horizontal" },
                { flipSpinners: true },
              ],
            },
          },
          ...this.getControlProps("translate"),
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
    recordingCursorKeyframes() {
      return this.store.recordingCursorKeyframes;
    },
    editingTextContent() {
      return this.store.editingTextContent;
    },
  },
  methods: {
    update({ property, value }) {
      this.selectedComponents.forEach((c) =>
        this.updateComponent(c, {
          [property]: value,
        })
      );
    },
    getControlProps(property, model_type = null) {
      const props = {
        property: property,
      };

      switch (property) {
        case "name":
        case "border-width":
        case "keyframes":
          props.label = null;
          break;

        case "border-color":
          props.label = this.$t("border");
          break;

        default:
          props.label = model_type
            ? this.$t(`${model_type}.${property}`)
            : this.$t(property);
      }

      if (
        (this.recordingCursorKeyframes && property !== "keyframes") ||
        (this.editingTextContent && property !== "text")
      ) {
        props.disabled = true;
      }

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
  overflow-x: hidden;
  overflow-y: auto;
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
        > .input-container {
          order: 1;
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
