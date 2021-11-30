import { AbstractComponent } from "@/player/models/ComponentHierarchy";
import { mix } from "mixwith";
import TimedComponent from "./mixins/TimedComponent";
import PositionableComponent from "./mixins/PositionableComponent";

export class Controller extends mix(
  AbstractComponent,
  PositionableComponent
).with(TimedComponent) {
  static entity = "Controller";

  static baseEntity = "AbstractComponent";
}

export default Controller;
