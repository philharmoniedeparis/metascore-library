import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import { createHtmlField } from "../utils/schema";

export default class Content extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
  static type = "Content";

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        text: createHtmlField({
          ajv,
          title: "Text",
        }),
      },
    });
  }
}
