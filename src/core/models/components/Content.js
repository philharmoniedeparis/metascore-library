import { AbstractComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Hideable from "./mixins/Hideable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Timeable from "./mixins/Timeable";
import { createStringField } from "../../utils/JSONSchema";
import { merge } from "lodash";

export class Content extends mix(AbstractComponent).with(
  Hideable,
  Positionable,
  Resizable,
  Backgroundable,
  Borderable,
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
