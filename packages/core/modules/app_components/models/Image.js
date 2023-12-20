import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import { createUrlField } from "@metascore-library/core/utils/schema";

export default class Image extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
  static type = "Image";

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        src: createUrlField({
          ajv,
          title: "Source",
        }),
      },
      required: ["src"],
    });
  }
}
