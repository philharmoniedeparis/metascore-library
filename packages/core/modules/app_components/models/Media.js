import { v4 as uuid } from "uuid";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import {
  createEnumField,
  createUrlField,
} from "@metascore-library/core/utils/schema";

export default class Media extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
  static type = "Media";

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        tag: createEnumField({
          title: "Tag",
          enum: ["audio", "video"],
          default: "audio",
        }),
        src: createUrlField({
          ajv,
          title: "Source",
        }),
      },
      if: {
        $id: uuid(), // Used for Ajv caching.
        properties: {
          tag: {
            const: "video",
          },
        },
      },
      then: {
        properties: {
          dimension: {
            ...super.schema.properties.dimension,
            default: [160, 120],
          },
        },
      },
      else: {
        properties: {
          dimension: {
            ...super.schema.properties.dimension,
            default: [50, 50],
          },
        },
      },
    });
  }
}
