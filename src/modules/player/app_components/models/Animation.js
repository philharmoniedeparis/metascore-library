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
  createTimeField,
  createBooleanField,
  createArrayField,
  createColorField,
} from "../utils/schema";

export class Animation extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Resizable,
  Transformable
) {
  static type = "Animation";

  static baseModel = EmbeddableComponent;

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        src: createUrlField({
          ajv,
          title: "Source",
        }),
        "start-frame": createNumberField({
          title: "Start frame",
          default: 1,
        }),
        "loop-duration": createTimeField({
          ajv,
          title: "Loop duration",
        }),
        reversed: createBooleanField({
          title: "Reversed",
        }),
        colors: createArrayField({
          title: "Colors",
          items: createColorField({ ajv }),
        }),
      },
    });
  }
}

export default Animation;
