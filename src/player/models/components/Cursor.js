import { AbstractComponent } from "@/player/models/ComponentHierarchy";
import { mix } from "mixwith";
import TimedComponent from "./mixins/TimedComponent";
import PositionableComponent from "./mixins/PositionableComponent";
import ResizableComponent from "./mixins/ResizableComponent";

export class Cursor extends mix(
  AbstractComponent,
  PositionableComponent,
  ResizableComponent
).with(TimedComponent) {
  static entity = "Cursor";

  static baseEntity = "AbstractComponent";
}

export default Cursor;
