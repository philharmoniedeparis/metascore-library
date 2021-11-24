import { AbstractComponent, Block } from "@/player/models/ComponentHierarchy";
import { createRelationField } from "@/core/models/Helpers.js";
import { merge } from "@/core/utils/Object";

export class Scenario extends AbstractComponent {
  static entity = "Scenario";

  static baseEntity = "Component";

  static get schema() {
    const ajv = super.ajv;

    return merge(super.schema, {
      properties: {
        children: createRelationField({
          ajv,
          type: "hasManyBy",
          model: Block,
          foreign_key: "children_ids",
        }),
      },
    });
  }

  /**
   * @inheritdoc
   */
  static fields() {
    return {
      ...super.fields(),
      children_ids: this.attr(() => []),
    };
  }

  /**
   * @inheritdoc
   */
  $toJson() {
    const json = super.$toJson();
    delete json.children_ids;

    return json;
  }
}

export default Scenario;
