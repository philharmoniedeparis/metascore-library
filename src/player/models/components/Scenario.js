import { AbstractComponent, Block } from "@/player/models/ComponentHierarchy";
import { createCollectionField } from "@/core/models/Helpers.js";
import { merge } from "lodash";

export class Scenario extends AbstractComponent {
  static entity = "Scenario";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = super.ajv;

    return merge(super.schema, {
      properties: {
        children: createCollectionField({
          ajv,
          model: Block,
          foreign_key: "children_ids",
        }),
      },
    });
  }
}

export default Scenario;
