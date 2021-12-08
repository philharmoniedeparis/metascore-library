import { EmbeddableComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Timeable from "./mixins/Timeable";
import { merge } from "lodash";

export class VideoRenderer extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Hideable,
  Opacitiable,
  Positionable,
  Resizable,
  Timeable
) {
  static entity = "VideoRenderer";

  static baseEntity = "EmbeddableComponent";

  static get schema() {
    return merge(super.schema, {
      properties: {
        dimension: {
          default: [320, 240],
        },
      },
    });
  }
}

export default VideoRenderer;
