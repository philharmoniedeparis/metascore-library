import { AbstractComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Hideable from "./mixins/Hideable";
import Positionable from "./mixins/Positionable";
import Timeable from "./mixins/Timeable";

export class Controller extends mix(AbstractComponent).with(
  Hideable,
  Positionable,
  Timeable
) {
  static entity = "Controller";

  static baseEntity = "AbstractComponent";
}

export default Controller;
