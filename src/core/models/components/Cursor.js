import { AbstractComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Hideable from "./mixins/Hideable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Timeable from "./mixins/Timeable";
import {
  createEnumField,
  createStringField,
  createAnimatedField,
  createNumberField,
  createAngleField,
  createTimeField,
  createColorField,
} from "../../utils/JSONSchema";
import { merge } from "lodash";

export class Cursor extends mix(AbstractComponent).with(
  Hideable,
  Positionable,
  Resizable,
  Backgroundable,
  Borderable,
  Timeable
) {
  static entity = "Cursor";

  static baseEntity = "AbstractComponent";

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
        }),
        "cursor-color": createColorField({
          ajv,
          title: "Cursor color",
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
          keyframes: createAnimatedField({
            ajv,
            title: "Keyframes",
            subfield: createNumberField(),
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
          "loop-duration": createTimeField({
            ajv,
            title: "Start angle",
          }),
        },
      },
    });
  }
}

export default Cursor;
