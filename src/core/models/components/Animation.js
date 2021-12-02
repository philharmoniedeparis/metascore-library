import { AbstractComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Hideable from "./mixins/Hideable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Timeable from "./mixins/Timeable";
import {
  createUrlField,
  createNumberField,
  createTimeField,
  createBooleanField,
  createArrayField,
  createColorField,
} from "../../utils/JSONSchema";
import { merge } from "lodash";

export class Animation extends mix(AbstractComponent).with(
  Hideable,
  Positionable,
  Resizable,
  Backgroundable,
  Borderable,
  Timeable
) {
  static entity = "Animation";

  static baseEntity = "AbstractComponent";

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
          items: {
            ...createColorField({ ajv }),
          },
        }),
      },
    });
  }
}

export default Animation;
