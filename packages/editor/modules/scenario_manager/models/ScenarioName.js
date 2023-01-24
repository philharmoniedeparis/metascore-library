import { merge } from "lodash";
import AbstractModel from "@metascore-library/core/models/AbstractModel";
import { createStringField } from "@metascore-library/core/utils/schema";

export default class ScenarioName extends AbstractModel {
  /**
   * @inheritdoc
   */
  static get schemaId() {
    return "scenario-manager:scenario-name";
  }

  /**
   * @inheritdoc
   */
  static get schema() {
    return Object.freeze(
      merge(super.schema, {
        properties: {
          name: createStringField({
            minLength: 1,
          }),
        },
        required: ["name"],
      })
    );
  }
}
