import { merge } from "lodash";
import AbstractModel from "@metascore-library/core/models/AbstractModel";
import {
  createFileField,
  createUrlField,
} from "@metascore-library/core/utils/schema";

export default class MediaSource extends AbstractModel {
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
      })
    );
  }
}
