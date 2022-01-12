import { mix } from "mixwith";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Timeable from "./mixins/Timeable";
import Transformable from "./mixins/Transformable";
import {
  createUrlField,
  createNumberField,
  createEnumField,
  createStringField,
  createArrayField,
  createColorField,
} from "../utils/schema";

export class SVG extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Hideable,
  Opacitiable,
  Positionable,
  Resizable,
  Timeable,
  Transformable
) {
  static entity = "SVG";

  static baseEntity = "EmbeddableComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        "svg-src": createUrlField({
          ajv,
          title: "Source",
        }),
        "svg-stroke": createColorField({
          ajv,
          title: "Stroke",
        }),
        "svg-stroke-width": createNumberField({
          ajv,
          title: "Stroke width",
          multipleOf: 1,
          minimum: 0,
        }),
        "svg-stroke-dasharray": createEnumField({
          title: "Stroke width",
          enum: ["2,2", "5,5", "5,2,2,2", "5,2,2,2,2,2"],
        }),
        fill: createColorField({
          ajv,
          title: "Fill",
        }),
        "svg-marker-start": createStringField({
          title: "Marker start",
        }),
        "svg-marker-mid": createStringField({
          title: "Marker mid",
        }),
        "svg-marker-end": createStringField({
          title: "Marker end",
        }),
        "svg-colors": createArrayField({
          title: "Colors",
          items: createColorField({ ajv }),
        }),
      },
    });
  }
}

export default SVG;
