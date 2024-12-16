<template>
  <component-wrapper :component="component">
    <object ref="object" type="image/svg+xml" tabindex="-1" :data="src" @load="onLoad"></object>
  </component-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { isFunction } from "lodash";
import { SVG_PROPERTIES, SVG_ELEMENTS } from "../models/SVG";

export default defineComponent ({
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
      svg: null,
    };
  },
  computed: {
    src() {
      return this.component.src;
    },
    colors() {
      return this.component.colors;
    },
    markers() {
      const markers = {};

      if (this.svg) {
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
      this.svg = null;
    },
    component: {
      handler() {
        this.updateProperties();
        this.updateColors();
      },
      deep: true,
    },
  },
  mounted() {
    this._mutation_observer = new MutationObserver(this.onMutation);
    this._mutation_observer.observe(this.$el.parentNode, {
      attributes: false,
      childList: true,
      subtree: false,
    });
  },
  unmounted() {
    if (this._mutation_observer) {
      this._mutation_observer.disconnect();
      delete this._mutation_observer;
    }
  },
  methods: {
    onLoad() {
      this.svg = this.$refs.object?.contentDocument?.querySelector("svg");
      this.updateProperties();
      this.updateColors();
    },
    onMutation() {
      // The SVG object's document reference seems to point
      // to a wrong element when moved around the DOM tree.
      if (
        this.svg !== this.$refs.object.contentDocument?.querySelector("svg")
      ) {
        if (this.$refs.object.contentDocument) {
          this.onLoad();
        } else {
          this.$refs.object.addEventListener("load", this.onLoad);
        }
      }
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
});
</script>

<style lang="scss" scoped>
object {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
