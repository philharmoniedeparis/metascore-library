import { v4 as uuid } from "uuid";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import {
  createEnumField,
  createStringField,
  createArrayField,
  createNumberField,
  createIntegerField,
  createTimeField,
  createColorField,
} from "@metascore-library/core/utils/schema";
import { createAngleField } from "../utils/schema";

export default class Cursor extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
  static type = "Cursor";

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        form: createEnumField({
          title: "Form",
          enum: ["linear", "circular"],
          default: "linear",
        }),
        direction: createStringField({
          title: "Direction",
        }),
        acceleration: createNumberField({
          title: "Acceleration",
          minimum: 0.01,
          maximum: 2,
          default: 1,
        }),
        "cursor-width": createNumberField({
          title: "Cursor width",
          multipleOf: 1,
          minimum: 0,
          default: 1,
        }),
        "cursor-color": createColorField({
          ajv,
          title: "Cursor color",
          default: "#000",
        }),
      },
      if: {
        $id: uuid(), // Used for Ajv caching.
        properties: {
          form: {
            const: "circular",
          },
        },
      },
      then: {
        properties: {
          direction: {
            enum: ["cw", "ccw"],
            default: "cw",
          },
          "start-angle": createAngleField({
            ajv,
            title: "Start angle",
          }),
          "loop-duration": createTimeField({
            ajv,
            title: "Loop duration",
          }),
        },
      },
      else: {
        properties: {
          direction: {
            enum: ["right", "left", "bottom", "top"],
            default: "right",
          },
          keyframes: createArrayField({
            title: "Keyframes",
            default: [],
            items: {
              type: "array",
              items: [createTimeField({ ajv }), createIntegerField()],
              minItems: 2,
              additionalItems: false,
            },
          }),
        },
      },
    });
  }

  /**
   * @inheritdoc
   */
  async validate(data) {
    // Update direction options depending on form.
    switch (data.form) {
      case "circular":
        if (!["cw", "ccw"].includes(data.direction)) {
          data.direction = "cw";
        }
        break;

      default:
        if (!["right", "left", "bottom", "top"].includes(data.direction)) {
          data.direction = "right";
        }
    }

    return super.validate(data);
  }
}
