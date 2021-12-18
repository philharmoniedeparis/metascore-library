<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="svg">
    <object
      ref="object"
      type="image/svg+xml"
      :data="model.src"
      @load="onLoad"
    ></object>
  </component-wrapper>
</template>

<script>
import ComponentWrapper from "./ComponentWrapper.vue";
import { isFunction } from "lodash";

const SVG_PROPERTIES = [
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "fill",
  "marker-start",
  "marker-mid",
  "marker-end",
];

const SVG_ELEMENTS = [
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
];

export default {
  components: {
    ComponentWrapper,
  },
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loaded: false,
      colors: null,
    };
  },
  computed: {
    svg() {
      if (!this.loaded) {
        return null;
      }

      const contentDocument = this.$refs.object.contentDocument;
      if (!contentDocument) {
        return null;
      }

      return contentDocument.querySelector("svg");
    },
    markers() {
      const markers = {};

      if (this.loaded) {
        this.svg.querySelectorAll("defs marker").forEach((el) => {
          const id = el.getAttribute("id");
          markers[id] = el;
        });
      }

      return markers;
    },
  },
  watch: {
    src() {
      this.loaded = false;
    },
    loaded() {
      this.updateProperties();
      this.updateColors();
    },
    model: {
      handler() {
        this.updateProperties();
        this.updateColors();
      },
      deep: true,
    },
  },
  methods: {
    onLoad() {
      this.loaded = true;
    },

    /**
     * Update SVG properties with component property values.
     */
    updateProperties() {
      if (this.svg) {
        SVG_PROPERTIES.forEach((property) => {
          this.updateProperty(property, false);
        });

        this.executeInnerUpdate();
      }
    },

    /**
     * Update an SVG property with corresponding component property value.
     */
    updateProperty(property, executeInnerUpdate) {
      if (this.svg) {
        const value = this.model[property];

        this.svg.querySelectorAll(SVG_ELEMENTS.join(",")).forEach((el) => {
          if (property.indexOf("marker-") === 0) {
            el.style[property] = value ? `url("#${value}")` : null;
          } else {
            el.style[property] = value;
          }
        });

        if (executeInnerUpdate !== false) {
          this.executeInnerUpdate();
        }
      }
    },

    /**
     * Update the svg's colors.
     */
    updateColors() {
      if (this.svg) {
        (this.model.colors ?? [null, null]).forEach((color, index) => {
          this.svg.querySelectorAll(`.color${index + 1}`).forEach((el) => {
            el.style.fill = color;
          });
        });
      }
    },

    /**
     * Execute the embedded update function if it exists.
     */
    executeInnerUpdate() {
      if (this.svg && isFunction(this.svg.update)) {
        this.svg.update();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.svg {
  ::v-deep(object) {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>
