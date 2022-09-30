import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import { createArrayField } from "@metascore-library/core/utils/schema";

export default class BlockToggler extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static type = "BlockToggler";

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
          default: "#eee",
        },
        "border-width": {
          default: 1,
        },
        "border-color": {
          default: "#eee",
        },
        dimension: {
          default: [100, 20],
          items: [{ minimum: 10 }, { minimum: 10 }],
        },
        blocks: createArrayField({
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              id: { type: "string" },
            },
            additionalProperties: false,
            required: ["type", "id"],
          },
          default: [],
        }),
      },
    });
  }
}
