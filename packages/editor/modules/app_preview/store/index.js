import { defineStore } from "pinia";
import { paramCase } from "param-case";

export default defineStore("app-preview", {
  state: () => {
    return {
      zoom: 1,
      preview: false,
      iframe: null,
    };
  },
  getters: {
    getComponentElement() {
      return (component) => {
        return this.iframe.contentDocument.body.querySelector(
          `.metaScore-component.${paramCase(component.type)}#${component.id}`
        );
      };
    },
  },
});
