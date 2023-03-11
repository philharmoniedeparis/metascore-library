<template>
  <component-wrapper :component="component">
    <object
      ref="object"
      type="image/svg+xml"
      tabindex="-1"
      :data="src"
      @load="onLoad"
    ></object>
  </component-wrapper>
</template>

<script>
import { isFunction } from "lodash";
import { SVG_PROPERTIES, SVG_ELEMENTS } from "../models/SVG";

export default {
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loaded: false,
    };
  },
  computed: {
    src() {
      return this.component.src;
    },
    colors() {
      return this.component.colors;
    },
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
    component: {
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
        const value = this.component[property];

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
        (this.colors ?? [null, null]).forEach((color, index) => {
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
  :deep(object) {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>
