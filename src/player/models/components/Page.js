import { AbstractComponent } from "@/player/models/ComponentHierarchy";
import { createTimeField } from "@/core/models/Helpers.js";
import { merge } from "@/core/utils/Object";

export class Page extends AbstractComponent {
  static entity = "Page";

  static baseEntity = "Component";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        "start-time": createTimeField({
          ajv,
          title: "Start time",
          default: null,
        }),
        "end-time": createTimeField({
          ajv,
          title: "End time",
          default: null,
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
      children_ids: this.attr([]),
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

export default Page;
