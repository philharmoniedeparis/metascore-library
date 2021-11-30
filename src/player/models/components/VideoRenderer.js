import { AbstractComponent } from "@/player/models/ComponentHierarchy";
import { mix } from "mixwith";
import TimedComponent from "./mixins/TimedComponent";
import PositionableComponent from "./mixins/PositionableComponent";
import ResizableComponent from "./mixins/ResizableComponent";

export class VideoRenderer extends mix(
  AbstractComponent,
  PositionableComponent,
  ResizableComponent
).with(TimedComponent) {
  static entity = "VideoRenderer";

  static baseEntity = "AbstractComponent";
}

export default VideoRenderer;
