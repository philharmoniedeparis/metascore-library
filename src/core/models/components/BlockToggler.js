import { AbstractComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Hideable from "./mixins/Hideable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Timeable from "./mixins/Timeable";
import { createCollectionField } from "../../utils/JSONSchema";
import { merge } from "lodash";

export class BlockToggler extends mix(AbstractComponent).with(
  Hideable,
  Positionable,
  Resizable,
  Backgroundable,
  Borderable,
  Timeable
) {
  static entity = "BlockToggler";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        blocks: createCollectionField({
          ajv,
          model: "Block",
          foreign_key: "block_ids",
        }),
      },
    });
  }
}

export default BlockToggler;
