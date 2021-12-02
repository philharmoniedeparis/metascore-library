import { AbstractComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Hideable from "./mixins/Hideable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Timeable from "./mixins/Timeable";
import {
  createBooleanField,
  createEnumField,
  createCollectionField,
} from "../../utils/JSONSchema";
import { merge } from "lodash";

export class Block extends mix(AbstractComponent).with(
  Hideable,
  Positionable,
  Resizable,
  Backgroundable,
  Borderable,
  Timeable
) {
  static entity = "Block";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        synched: createBooleanField({
          title: "Synched",
        }),
        "pager-visibility": createEnumField({
          title: "Pager visibility",
          enum: ["auto", "hidden", "visible"],
          default: "auto",
        }),
        pages: createCollectionField({
          ajv,
          model: "Page",
          foreign_key: "pages_ids",
        }),
      },
    });
  }
}

export default Block;
