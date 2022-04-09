import { EmbeddableComponent } from ".";

import { merge } from "lodash";

export class Controller extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static type = "Controller";

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
        "background-color": {
          default: "#ccc",
        },
        "border-radius": {
          default: "10px",
        },
        dimension: {
          default: [90, 100],
        },
      },
    });
  }
}

export default Controller;