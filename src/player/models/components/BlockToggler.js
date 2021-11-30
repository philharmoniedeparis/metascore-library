import { AbstractComponent, Block } from "@/player/models/ComponentHierarchy";
import { mix } from "mixwith";
import TimedComponent from "./mixins/TimedComponent";
import PositionableComponent from "./mixins/PositionableComponent";
import ResizableComponent from "./mixins/ResizableComponent";
import { createCollectionField } from "@/core/models/Helpers.js";
import { merge } from "lodash";

export class BlockToggler extends mix(
  AbstractComponent,
  PositionableComponent,
  ResizableComponent
).with(TimedComponent) {
  static entity = "BlockToggler";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        blocks: createCollectionField({
          ajv,
          model: Block,
          foreign_key: "block_ids",
        }),
      },
    });
  }
}

export default BlockToggler;
