import { merge } from "lodash";
import { EmbeddableComponent, Page } from ".";
import {
  createBooleanField,
  createEnumField,
} from "@metascore-library/core/utils/schema";
import { createCollectionField } from "../utils/schema";

export class Block extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static type = "Block";

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
        pages: createCollectionField({
          ajv,
          model: Page,
        }),
      },
    });
  }
}

export default Block;
