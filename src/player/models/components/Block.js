import { AbstractComponent } from "@/player/models/ComponentHierarchy";
import {
  createTimeField,
  createBooleanField,
  createEnumField,
  createRelationField,
} from "@/core/models/Helpers.js";
import { merge } from "@/core/utils/Object";

export class Block extends AbstractComponent {
  static entity = "Block";

  static baseEntity = "Component";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        "start-time": createTimeField({
          ajv,
          title: "Start time",
        }),
        "end-time": createTimeField({
          ajv,
          title: "End time",
        }),
        synched: createBooleanField({
          title: "Synched",
        }),
        "pager-visibility": createEnumField({
          title: "Pager visibility",
          allowd_values: ["auto", "hidden", "visible"],
          default_value: "auto",
        }),
        pages: createRelationField({
          ajv,
          type: "hasManyBy",
          model: AbstractComponent,
          foreign_key: "pages_ids",
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
      pages_ids: this.attr([]),
    };
  }

  /**
   * @inheritdoc
   */
  $toJson() {
    const json = super.$toJson();
    delete json.pages_ids;

    return json;
  }
}

export default Block;
