import { mix } from "mixwith";
import * as Components from ".";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Timeable from "./mixins/Timeable";

export class EmbeddableComponent extends mix(Components.AbstractComponent).with(
  Hideable,
  Opacitiable,
  Positionable,
  Timeable
) {
  static entity = "EmbeddableComponent";

  static types() {
    return {
      Animation: Components.Animation,
      Block: Components.Block,
      BlockToggler: Components.BlockToggler,
      Content: Components.Content,
      Controller: Components.Controller,
      Cursor: Components.Cursor,
      Media: Components.Media,
      SVG: Components.SVG,
      VideoRenderer: Components.VideoRenderer,
    };
  }

  /**
   * Get a list of inheritance chain classes
   *
   * @returns {Class[]} The list of Model classes in the inheritance chain
   */
  static getModelChain() {
    if (this.entity === "EmbeddableComponent") {
      return [this, Components.AbstractComponent];
    }

    return Components.AbstractComponent.getModelChain.call(this);
  }
}

export default EmbeddableComponent;
