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
  createAngleField,
  createTimeField,
  createColorField,
} from "../utils/schema";

export class Cursor extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Resizable,
  Transformable
) {
  static entity = "Cursor";

  static baseEntity = "EmbeddableComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        "cursor-form": createEnumField({
          title: "Form",
          enum: ["linear", "circular"],
          default: "linear",
        }),
        "cursor-direction": createStringField({
          title: "Direction",
          default: "right",
        }),
        "cursor-acceleration": createNumberField({
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
          "cursor-form": {
            const: "linear",
          },
        },
      },
      then: {
        properties: {
          "cursor-direction": {
            enum: ["right", "left", "bottom", "top"],
            default: "right",
          },
          "cursor-keyframes": createArrayField({
            title: "Keyframes",
            default: [],
            items: {
              type: "array",
              items: [createTimeField({ ajv }), createNumberField()],
              minItems: 2,
              additionalItems: false,
            },
          }),
        },
      },
      else: {
        properties: {
          "cursor-direction": {
            enum: ["cw", "ccw"],
            default: "cw",
          },
          "cursor-start-angle": createAngleField({
            ajv,
            title: "Start angle",
          }),
          "cursor-loop-duration": createTimeField({
            ajv,
            title: "Start angle",
          }),
        },
      },
    });
  }
}

export default Cursor;
