import { merge } from "lodash";
import AbstractModel from "@metascore-library/core/models/AbstractModel";
import {
  createFileField,
  createUrlField,
} from "@metascore-library/core/utils/schema";

export default class MediaSource extends AbstractModel {
  /**
   * @inheritdoc
   */
  static get schemaId() {
    return "media-selector:media-source";
  }

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return Object.freeze(
      merge(super.schema, {
        properties: {
          file: createFileField({
            ajv,
          }),
          url: createUrlField({
            ajv,
          }),
        },
        oneOf: [
          {
            required: ["file"],
          },
          {
            required: ["url"],
          },
        ],
      })
    );
  }
}
