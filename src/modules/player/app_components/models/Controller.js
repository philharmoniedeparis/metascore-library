import { mix } from "mixwith";
import { EmbeddableComponent } from ".";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Timeable from "./mixins/Timeable";

export class Controller extends mix(EmbeddableComponent).with(
  Hideable,
  Opacitiable,
  Positionable,
  Timeable
) {
  static entity = "Controller";

  static baseEntity = "EmbeddableComponent";
}

export default Controller;
