import { merge } from "lodash";
import { EmbeddableComponent } from ".";

export class VideoRenderer extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static type = "VideoRenderer";

  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
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
