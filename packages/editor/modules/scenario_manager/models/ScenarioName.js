import { merge } from "lodash";
import AbstractModel from "@metascore-library/core/models/AbstractModel";
import { createStringField } from "@metascore-library/core/utils/schema";

export default class Scenario extends AbstractModel {
  static get schema() {
    return Object.freeze(
      merge(super.schema, {
        properties: {
          name: createStringField(),
        },
        required: ["name"],
      })
    );
  }
}
