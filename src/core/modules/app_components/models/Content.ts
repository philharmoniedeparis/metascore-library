import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import { createHtmlField } from "../utils/schema";

export default class Content extends EmbeddableComponent {

  /**
   * @inheritdoc
   */
  static type = "Content";

  /**
   * @inheritdoc
   */
  static get schema() {
    return merge(super.schema, {
      properties: {
        text: createHtmlField({
          ajv: this.ajv,
          title: "Text",
        }),
      },
    });
  }
}
