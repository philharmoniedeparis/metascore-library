import AbstractComponent from "./AbstractComponent";
import * as Components from "../ComponentHierarchy";

export class EmbeddableComponent extends AbstractComponent {
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
}

export default EmbeddableComponent;
