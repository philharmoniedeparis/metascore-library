import { defineCustomElement } from "vue";
import MultiSelect from "./MultiSelect.ce.vue";

export default class MultiSelectInput extends defineCustomElement(MultiSelect) {
  static formAssociated = true;
  static observedAttributes = ["value"];
  #internals;

  constructor() {
    super();

    this.#internals = this.attachInternals();
    this.#internals.ariaRole = "select";

    this.addEventListener("change", () => {
      console.log("change", this.value);
      this.#internals.setFormValue(this.value);
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log("attributeChangedCallback", name, oldValue, newValue);
    this.#internals.setFormValue(newValue);
  }

  get value() {
    return this.getValue();
  }

  set value(newValue) {
    this.setValue(newValue);
  }
}

customElements.define("metascore-multiselect", MultiSelectInput);
