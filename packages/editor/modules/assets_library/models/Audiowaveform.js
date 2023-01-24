import { merge } from "lodash";
import AbstractModel from "@metascore-library/core/models/AbstractModel";
import {
  createIntegerField,
  createBooleanField,
  createTimeField,
  createColorField,
} from "@metascore-library/core/utils/schema";

export default class Spectrogram extends AbstractModel {
  /**
   * @inheritdoc
   */
  static get schemaId() {
    return "assets-library:audiowaveform";
  }

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return Object.freeze(
      merge(super.schema, {
        properties: {
          width: createIntegerField({
            default: 400,
            minimum: 1,
          }),
          height: createIntegerField({
            default: 200,
            minimum: 1,
          }),
          "split-channels": createBooleanField({
            default: false,
          }),
          "no-axis-labels": createBooleanField({
            default: true,
          }),
          start: createTimeField({
            ajv,
          }),
          end: createTimeField({
            ajv,
          }),
          "background-color": createColorField({
            ajv,
            default: "#00000000",
          }),
          "waveform-color": createColorField({
            ajv,
            default: "#0000fe",
          }),
          "axis-label-color": createColorField({
            ajv,
            default: "#0000fe",
          }),
          "border-color": createColorField({
            ajv,
            default: "#0000fe",
          }),
        },
        required: ["width", "height"],
      })
    );
  }
}
