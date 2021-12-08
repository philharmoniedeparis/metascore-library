import { AbstractComponent, EmbeddableComponent } from "../ComponentHierarchy";
import { createCollectionField } from "../../utils/JSONSchema";
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
          model: EmbeddableComponent,
          foreign_key: "$children_ids",
        }),
      },
    });
  }
}

export default Scenario;
