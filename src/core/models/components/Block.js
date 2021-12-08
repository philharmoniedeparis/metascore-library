import { EmbeddableComponent, Page } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Timeable from "./mixins/Timeable";
import {
  createBooleanField,
  createEnumField,
  createCollectionField,
} from "../../utils/JSONSchema";
import { merge } from "lodash";

export class Block extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Hideable,
  Opacitiable,
  Positionable,
  Resizable,
  Timeable
) {
  static entity = "Block";

  static baseEntity = "EmbeddableComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        dimension: {
          default: [200, 200],
        },
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
          model: Page,
          foreign_key: "$pages_ids",
        }),
        $toggled: createBooleanField({
          default: false,
        }),
      },
    });
  }
}

export default Block;
