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
  static type = "EmbeddableComponent";

  static baseModel = Components.AbstractComponent;
}

export default EmbeddableComponent;
