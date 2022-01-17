import { merge } from "lodash";
import { mix } from "mixwith";
import { EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Resizable from "./mixins/Resizable";
import Transformable from "./mixins/Transformable";

export class VideoRenderer extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Resizable,
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
