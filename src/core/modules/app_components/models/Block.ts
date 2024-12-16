import { merge } from "lodash";
import { EmbeddableComponent, Page } from ".";
import { createBooleanField, createEnumField } from "@core/utils/schema";
import { createCollectionField } from "../utils/schema";

export default class Block extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
  static type = "Block";

  /**
   * @inheritdoc
   */
  static childrenProperty = "pages";

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        "background-color": {
          default: "rgb(238, 238, 238)",
        },
        "border-width": {
          default: 1,
        },
        "border-color": {
          default: "rgb(204, 204, 204)",
        },
        "border-radius": {
          default: "10px",
        },
        dimension: {
          default: [200, 200],
        },
        synched: createBooleanField({
          title: "Synched",
        }),
        "pager-visibility": createEnumField({
          title: "Pager visibility",
          enum: ["auto", "hidden", "visible"],
          default: "auto",
        }),
        [this.childrenProperty]: createCollectionField({
          ajv,
          model: Page,
        }),
      },
    });
  }
}
