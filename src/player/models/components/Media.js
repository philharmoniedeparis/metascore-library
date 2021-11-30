import { AbstractComponent } from "@/player/models/ComponentHierarchy";
import { mix } from "mixwith";
import TimedComponent from "./mixins/TimedComponent";
import PositionableComponent from "./mixins/PositionableComponent";
import ResizableComponent from "./mixins/ResizableComponent";

export class Media extends mix(
  AbstractComponent,
  PositionableComponent,
  ResizableComponent
).with(TimedComponent) {
  static entity = "Media";

  static baseEntity = "AbstractComponent";
}

export default Media;
