import { AbstractComponent, EmbeddableComponent } from "../ComponentHierarchy";
import { mix } from "mixwith";
import Backgroundable from "./mixins/Backgroundable";
import Timeable from "./mixins/Timeable";
import { createCollectionField } from "../../utils/JSONSchema";
import { merge } from "lodash";

export class Page extends mix(AbstractComponent).with(
  Backgroundable,
  Timeable
) {
  static entity = "Page";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        children: createCollectionField({
          ajv,
          model: EmbeddableComponent,
          foreign_key: "children_ids",
        }),
      },
    });
  }
}

export default Page;
