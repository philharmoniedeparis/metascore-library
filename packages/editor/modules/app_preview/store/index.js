import { defineStore } from "pinia";
import { paramCase } from "param-case";

export default defineStore("app-preview", {
  state: () => {
    return {
      zoom: 1,
      preview: false,
      iframeBody: null,
    };
  },
  getters: {
    getComponentElement() {
      return (component) => {
        return this.iframeBody.querySelector(
          `.metaScore-component.${paramCase(component.type)}#${component.id}`
        );
      };
    },
  },
});
