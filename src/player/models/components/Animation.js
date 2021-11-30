import { AbstractComponent } from "@/player/models/ComponentHierarchy";
import { mix } from "mixwith";
import TimedComponent from "./mixins/TimedComponent";

export class Animation extends mix(AbstractComponent).with(TimedComponent) {
  static entity = "Animation";

  static baseEntity = "AbstractComponent";
}

export default Animation;
