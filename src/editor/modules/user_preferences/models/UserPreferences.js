import { merge } from "lodash";
import AbstractModel from "@core/models/AbstractModel";
import {
  createIntegerField,
  createColorField,
  createBooleanField,
} from "@core/utils/schema";

export default class UserPreferences extends AbstractModel {
  /**
   * @inheritdoc
   */
  static get schemaId() {
    return "user-preferences";
  }

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return Object.freeze(
      merge(super.schema, {
        properties: {
          "workspace.grid-color": createColorField({
            ajv,
            default: "rgba(0, 0, 0, 0.1)",
          }),
          "workspace.grid-step": createIntegerField({
            default: 10,
            minimum: 2,
          }),
          "workspace.snap-to-grid": createBooleanField({
            default: false,
          }),
          "workspace.snap-to-siblings": createBooleanField({
            default: true,
          }),
          "workspace.snap-range": createIntegerField({
            default: 5,
            minimum: 2,
          }),
        },
      })
    );
  }
}
