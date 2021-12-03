import { AbstractComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Timeable from "./mixins/Timeable";
import { createStringField } from "../../utils/JSONSchema";
import { merge } from "lodash";

export class Content extends mix(AbstractComponent).with(
  Backgroundable,
  Borderable,
  Hideable,
  Opacitiable,
  Positionable,
  Resizable,
  Timeable
) {
  static entity = "Content";

  static baseEntity = "AbstractComponent";

  static get schema() {
    return merge(super.schema, {
      properties: {
        text: createStringField({
          title: "Text",
        }),
      },
    });
  }
}

export default Content;
