import { AbstractComponent } from "@/player/models/ComponentHierarchy";
import { createTimeField } from "@/core/models/Helpers.js";
import { merge } from "@/core/utils/Object";

export class VideoRenderer extends AbstractComponent {
  static entity = "VideoRenderer";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        "start-time": createTimeField({
          ajv,
          title: "Start time",
          default: null,
        }),
        "end-time": createTimeField({
          ajv,
          title: "End time",
          default: null,
        }),
      },
    });
  }

  /**
   * @inheritdoc
   */
  static fields() {
    return {
      ...super.fields(),
    };
  }
}

export default VideoRenderer;
