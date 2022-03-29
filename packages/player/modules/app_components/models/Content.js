import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import { createHtmlField } from "../utils/schema";

export class Content extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static type = "Content";

  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

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

export default Content;
