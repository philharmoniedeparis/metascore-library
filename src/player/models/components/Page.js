import { AbstractComponent } from "@/player/models/ComponentHierarchy";
import { mix } from "mixwith";
import TimedComponent from "./mixins/TimedComponent";
import { createCollectionField } from "@/core/models/Helpers.js";
import { merge } from "lodash";

export class Page extends mix(AbstractComponent).with(TimedComponent) {
  static entity = "Page";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        children: createCollectionField({
          ajv,
          model: AbstractComponent,
          foreign_key: "children_ids",
        }),
      },
    });
  }
}

export default Page;
