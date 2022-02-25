import { mix } from "mixwith";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Resizable from "./mixins/Resizable";
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
  Resizable,
  Transformable
) {
  static type = "SVG";

  static baseModel = EmbeddableComponent;

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        src: createUrlField({
          ajv,
          title: "Source",
        }),
        stroke: createColorField({
          ajv,
          title: "Stroke",
        }),
        "stroke-width": createNumberField({
          ajv,
          title: "Stroke width",
          multipleOf: 1,
          minimum: 0,
        }),
        "stroke-dasharray": createEnumField({
          title: "Stroke width",
          enum: [null, "2,2", "5,5", "5,2,2,2", "5,2,2,2,2,2"],
        }),
        fill: createColorField({
          ajv,
          title: "Fill",
        }),
        "marker-start": createStringField({
          title: "Marker start",
        }),
        "marker-mid": createStringField({
          title: "Marker mid",
        }),
        "marker-end": createStringField({
          title: "Marker end",
        }),
        colors: createArrayField({
          title: "Colors",
          items: createColorField({ ajv }),
        }),
      },
    });
  }
}

export default SVG;