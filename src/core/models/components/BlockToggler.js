import { EmbeddableComponent, Block } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Timeable from "./mixins/Timeable";
import Transformable from "./mixins/Transformable";
import { createCollectionField } from "../../utils/JSONSchema";
import { merge } from "lodash";

export class BlockToggler extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Hideable,
  Opacitiable,
  Positionable,
  Resizable,
  Timeable,
  Transformable
) {
  static entity = "BlockToggler";

  static baseEntity = "EmbeddableComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        "background-color": {
          default: "#eee",
        },
        "border-width": {
          default: 1,
        },
        "border-color": {
          default: "#eee",
        },
        dimension: {
          default: [100, 20],
          items: [
            {
              minimum: 10,
            },
            {
              minimum: 10,
            },
          ],
        },
        blocks: createCollectionField({
          ajv,
          model: Block,
          foreign_key: "$block_ids",
        }),
      },
    });
  }
}

export default BlockToggler;
