import { merge } from "lodash";
import EmbeddableComponent from "./EmbeddableComponent";
import { createUrlField } from "@core/utils/schema";

export default class Image extends EmbeddableComponent {

  /**
   * @inheritdoc
   */
  static type = "Image";

  /**
   * @inheritdoc
   */
  static get schema() {
    return merge(super.schema, {
      properties: {
        src: createUrlField({
          ajv: this.ajv,
          title: "Source",
        }),
      },
      required: ["src"],
    });
  }
}
