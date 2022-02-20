import { mix } from "mixwith";
import { AbstractComponent } from ".";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Timeable from "./mixins/Timeable";

export class EmbeddableComponent extends mix(AbstractComponent).with(
  Hideable,
  Opacitiable,
  Positionable,
  Timeable
) {
  static type = "EmbeddableComponent";

  static baseModel = AbstractComponent;
}

export default EmbeddableComponent;
