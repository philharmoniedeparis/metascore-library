import { AbstractComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Timeable from "./mixins/Timeable";
import { createEnumField, createUrlField } from "../../utils/JSONSchema";
import { merge } from "lodash";

export class Media extends mix(AbstractComponent).with(
  Backgroundable,
  Borderable,
  Hideable,
  Opacitiable,
  Positionable,
  Resizable,
  Timeable
) {
  static entity = "Media";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        tag: createEnumField({
          title: "Tag",
          enum: ["audio", "video"],
          default: "audio",
        }),
        src: createUrlField({
          ajv,
          title: "Source",
        }),
      },
    });
  }
}

export default Media;
