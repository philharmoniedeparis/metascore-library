<i18n>
{
  "fr": {
    "title": "Attributs",
    "name": "Nom",
    "hidden": "Caché au démarrage",
    "background-color": "Couleur de fond",
    "background-image": "Image de fond",
    "background-image.empty": "-- aucune --",
    "border": "Bordure",
    "border-radius": "Rayon",
    "position": "Position",
    "dimension": "Dimension",
    "start-time": "Début",
    "end-time": "Fin",
    "opacity": "Opacité",
    "translate": "Translation",
    "scale": "Échelle",
    "rotate": "Rotation",
    "multival": "La valeur correspond à celle du premier composant sélectionné",
    "AbstractComponent": {
      "title": "Attributs du composant | Attributs de {count} composants"
    },
    "EmbeddableComponent": {
      "title": "Attributs du composant | Attributs de {count} composants"
    },
    "Animation": {
      "title": "Attributs de l’animation | Attributs de {count} animations",
      "start-frame": "Image de départ",
      "loop-duration": "Durée d’une boucle",
      "reversed": "Inversé",
      "colors": "Couleurs",
    },
    "Block": {
      "title": "Attributs du bloc | Attributs de {count} blocs",
      "pager-visibility": "Visibilité du tourne page",
      "pager-visibility-options": {
        "auto": "Auto",
        "hidden": "Caché",
        "visible": "Affiché",
      }
    },
    "BlockToggler": {
      "title": "Attributs du contrôleur de blocs | Attributs de {count} contrôleurs de blocs",
      "blocks": "Blocs",
    },
    "Content": {
      "title": "Attributs du texte | Attributs de {count} textes",
      "text": {
        "on": "Éditer le contenu",
        "off": "Arrêter l’édition du contenu",
      },
    },
    "Controller": {
      "title": "Attributs du contrôleur | Attributs de {count} contrôleurs",
    },
    "Cursor": {
      "title": "Attributs du curseur | Attributs de {count} curseurs",
      "form": "Forme",
      "form-options": {
        "linear": "Linéaire",
        "circular": "Circulaire",
      },
      "direction": "Direction",
      "acceleration": "Accélération",
      "keyframes": {
        "on": "Enregistrer les positions",
        "off": "Arrêter l’enregistrement",
      },
      "start-angle": "Angle de départ",
      "loop-duration": "Durée d’une boucle",
      "cursor-width": "Largeur du curseur",
      "cursor-color": "Couleur du curseur",
    },
    "Media": {
      "title": "Attributs du média | Attributs de {count} média",
    },
    "Page": {
      "title": "Attributs de la page {index}/{total} | Attributs de {count} pages",
    },
    "Scenario": {
      "title": "Attributs du scénario | Attributs de {count} scénarios",
    },
    "SVG": {
      "title": "Attributs du SVG | Attributs de {count} SVGs",
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
      "title": "Attributs du rendu vidéo | Attributs de {count} rendus vidéo",
    },
  },
  "en": {
    "title": "Attributes",
    "name": "Name",
    "hidden": "Hidden on start",
    "background-color": "Background color",
    "background-image": "Background image",
    "background-image.empty": "-- none --",
    "border": "Border",
    "border-radius": "Radius",
    "position": "Position",
    "dimension": "Dimension",
    "start-time": "Start",
    "end-time": "End",
    "opacity": "Opacity",
    "translate": "Translation",
    "scale": "Scale",
    "rotate": "Rotation",
    "multival": "The value corresponds to that of the first selected component",
    "AbstractComponent": {
      "title": "Attributes of component | Attributes of {count} components"
    },
    "EmbeddableComponent": {
      "title": "Attributes of component | Attributes of {count} components"
    },
    "Animation": {
      "title": "Attributes of animation | Attributes of {count} animations",
      "start-frame": "Start frame",
      "loop-duration": "Loop duration",
      "reversed": "Reversed",
      "colors": "Colors",
    },
    "Block": {
      "title": "Attributes of block | Attributes of {count} blocks",
      "pager-visibility": "Pager visibility",
      "pager-visibility-options": {
        "auto": "Auto",
        "hidden": "Hidden",
        "visible": "Visible",
      }
    },
    "BlockToggler": {
      "title": "Attributes of block toggler | Attributes of {count} block togglers",
      "blocks": "Blocks",
    },
    "Content": {
      "title": "Attributes of text | Attributes of {count} texts",
      "text": {
        "on": "Edit the content",
        "off": "Stop content editing",
      },
    },
    "Controller": {
      "title": "Attributes of controller | Attributes of {count} controllers",
    },
    "Cursor": {
      "title": "Attributes of cursor | Attributes of {count} cursors",
      "form": "Form",
      "form-options": {
        "linear": "Linear",
        "circular": "Circular",
      },
      "direction": "Direction",
      "acceleration": "Acceleration",
      "keyframes": {
        "on": "Record positions",
        "off": "Stop recording",
      },
      "start-angle": "Start angle",
      "loop-duration": "Loop duration",
      "cursor-width": "Cursor width",
      "cursor-color": "Cursor color",
    },
    "Media": {
      "title": "Attributes of media | Attributes of {count} media",
    },
    "Page": {
      "title": "Attributes of page {index}/{total} | Attributes of {count} pages",
    },
    "Scenario": {
      "title": "Attributes of scenario | Attributes of {count} scenarios",
    },
    "SVG": {
      "title": "Attributes of SVG | Attributes of {count} SVGs",
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
      "title": "Attributes of video renderer | Attributes of {count} video renderers",
    },
  },
}
</i18n>

<template>
  <div
    v-if="masterComponent"
    :class="['component-form', kebabCase(masterComponent.type)]"
  >
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
import { intersection, kebabCase } from "lodash";
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
      getModelByType,
      getComponentParent,
      getComponentChildren,
      updateComponent,
      isComponentTimeable,
    } = useModule("app_components");
    const { selectedComponents, isComponentLocked, preview } =
      useModule("app_preview");
    const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
      useModule("history");
    return {
      store,
      getModelByType,
      getComponentParent,
      getComponentChildren,
      updateComponent,
      isComponentTimeable,
      selectedComponents,
      isComponentLocked,
      preview,
      startHistoryGroup,
      endHistoryGroup,
    };
  },
  data() {
    return {
      historyCoalesceId: null,
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
        const model = this.getModelByType(component.type);
        const modelChain = model.modelChain;
        models = index > 0 ? intersection(models, modelChain) : modelChain;
      });
      return models[0];
    },
    title() {
      if (!this.commonModel) {
        return this.$t("title");
      }

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
          options: [
            { name: this.$t("background-image.empty"), id: -1, url: null },
            ...this.images,
          ],
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
          disabled: this.selectedComponents.some(this.isComponentLocked),
          ...this.getControlProps("position"),
        });
      }

      if (this.commonModel.$isResizable) {
        layout.items[0].items.push({
          itemProps: [
            { spinnersDirection: "horizontal" },
            { flipSpinners: true },
          ],
          disabled: this.selectedComponents.some(this.isComponentLocked),
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
            ...this.getControlProps("colors", this.commonModel.type),
          });
          break;

        case "Block":
          layout.items[0].items.push({
            type: "select",
            options: this.schema.properties["pager-visibility"].enum.map(
              (v) => {
                return {
                  label: this.$t(`Block.pager-visibility-options.${v}`),
                  value: v,
                };
              }
            ),
            ...this.getControlProps("pager-visibility", this.commonModel.type),
          });
          break;

        case "BlockToggler":
          layout.items[0].items.push({
            type: "select",
            multiple: true,
            options: this.firstLevelComponents,
            optionLabel: ({ name }) => name,
            optionKey: ({ type, id }) => `${type}:${id}`,
            optionValue: ({ type, id }) => ({ type, id }),
            valueComparator: (a, b) => a.type === b.type && a.id === b.id,
            ...this.getControlProps("blocks", this.commonModel.type),
          });
          break;

        case "Content":
          if (this.selectedComponentsCount === 1) {
            layout.items[0].items.push({
              type: "html",
              component: this.masterComponent,
              "extra-fonts": this.store.configs.extraFonts,
              ...this.getControlProps("text", this.commonModel.type),
            });
          }
          break;

        case "Cursor":
          layout.items[0].items.push({
            type: "select",
            options: this.schema.properties["form"].enum.map((v) => {
              return {
                label: this.$t(`Cursor.form-options.${v}`),
                value: v,
              };
            }),
            ...this.getControlProps("form", this.commonModel.type),
          });
          [
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
              component: this.masterComponent,
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

      if (this.selectedComponents.every(this.isComponentTimeable)) {
        const items = [
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
        ];

        this.selectedComponents.forEach((component) => {
          if (component.type === "Page") {
            const block = this.getComponentParent(component);
            const pages = this.getComponentChildren(block);
            const index = pages.findIndex((c) => c.id === component.id);

            if (index === 0) items[0].disabled = true;
            if (index === pages.length - 1) items[1].disabled = true;
          }
        });

        layout.items.push({
          type: "markup",
          class: "form-container horizontal time",
          items,
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
        animated.push(this.getControlProps("rotate"));
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
  watch: {
    title(value) {
      this.store.title = value;
    },
    selectedComponents(value) {
      const ids = [];
      for (const component of value) {
        ids.push(`${component.type}:${component.id}`);
      }
      this.historyCoalesceId = ids.join();
    },
  },
  methods: {
    kebabCase,
    async update({ property, value }) {
      this.startHistoryGroup({
        coalesce: true,
        coalesceId: `${this.historyCoalesceId}|${property}`,
      });

      // Update all selected components.
      for (const component of this.selectedComponents) {
        await this.updateComponent(component, {
          [property]: value,
        });
      }

      this.endHistoryGroup();
    },
    getControlProps(property, model_type = null) {
      const props = {
        property: property,
      };

      switch (property) {
        case "name":
        case "border-width":
          props.label = "";
          break;

        case "text":
        case "keyframes":
          props.label = {
            on: this.$t(`${model_type}.${property}.on`),
            off: this.$t(`${model_type}.${property}.off`),
          };
          break;

        case "border-color":
          props.label = this.$t("border");
          break;

        default:
          props.label = model_type
            ? this.$t(`${model_type}.${property}`)
            : this.$t(property);
      }

      if (this.isPropertyMultival(property)) {
        props.label += `<span class="multival-warning" title="${this.$t(
          "multival"
        )}">⚠</span>`;
      }

      if (
        this.preview ||
        (this.recordingCursorKeyframes && property !== "keyframes") ||
        (this.editingTextContent && property !== "text")
      ) {
        props.disabled = true;
      }

      return props;
    },
    isPropertyMultival(property) {
      return (
        this.selectedComponents.length > 1 &&
        this.selectedComponents.some((component) => {
          return component[property] !== this.masterComponent[property];
        })
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@metascore-library/editor/scss/variables";

.component-form {
  display: flex;
  height: 100%;
  flex-direction: column;
  background: var(--metascore-color-bg-secondary);
  overflow-x: hidden;
  overflow-y: auto;
  color: var(--metascore-color-white);

  h2.title {
    position: sticky;
    top: 0;
    flex: 0 0 auto;
    margin: 0;
    padding: 0.5em;
    padding-left: 1em;
    font-size: 1em;
    font-weight: normal;
    background: var(--metascore-color-bg-primary);
    border-bottom: 0.25em solid var(--metascore-color-bg-secondary);
    z-index: 1;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 0.5em;
      height: 100%;
    }
  }

  @each $component, $color in $component-colors {
    @if $component == default {
      h2.title::before {
        background-color: var(--metascore-color-component-#{$component});
      }
    } @else {
      &.#{$component} {
        h2.title::before {
          background-color: var(--metascore-color-component-#{$component});
        }
      }
    }
  }

  :deep(.form-container) {
    display: flex;
    background: var(--metascore-color-bg-primary);
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
      border-top: 2px solid var(--metascore-color-bg-secondary);

      input {
        width: 6em;
      }
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

        &.disabled {
          > .input-wrapper > label {
            opacity: 0.5;
          }
        }
      }

      input {
        &:not([type="checkbox"]):not([type="radio"]) {
          background: var(--metascore-color-bg-primary);
        }
      }
    }

    .form-container {
      padding: 0;
    }
  }

  :deep(.control) {
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

    .multival-warning {
      margin-left: 0.5em;
      color: #ffbf00;
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
