import { merge } from "lodash";
import { mix } from "mixwith";
import { EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Timeable from "./mixins/Timeable";
import Transformable from "./mixins/Transformable";

export class VideoRenderer extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Hideable,
  Opacitiable,
  Positionable,
  Resizable,
  Timeable,
  Transformable
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
