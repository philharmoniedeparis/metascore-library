import { mix } from "mixwith";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Resizable from "./mixins/Resizable";
import Transformable from "./mixins/Transformable";
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

export class Cursor extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Resizable,
  Transformable
) {
  static type = "Cursor";

  static baseModel = EmbeddableComponent;

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
          default: "right",
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
        properties: {
          form: {
            const: "linear",
          },
        },
      },
      then: {
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
      else: {
        properties: {
          direction: {
            enum: ["cw", "ccw"],
            default: "cw",
          },
          "start-angle": createAngleField({
            ajv,
            title: "Start angle",
          }),
          duration: createTimeField({
            ajv,
            title: "Start angle",
          }),
        },
      },
    });
  }
}

export default Cursor;
