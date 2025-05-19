import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import { createEnumField, createUrlField } from "@core/utils/schema";

export default class Media extends EmbeddableComponent {

  /**
   * @inheritdoc
   */
  static type = "Media";

  /**
   * @inheritdoc
   */
  static get schema() {
    return merge(super.schema, {
      properties: {
        tag: createEnumField({
          title: "Tag",
          enum: ["audio", "video"],
          default: "audio",
        }),
        src: createUrlField({
          ajv: this.ajv,
          title: "Source",
        }),
      },
      if: {
        $id: `${this.schemaId}:tag-if`, // Used for Ajv caching.
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
