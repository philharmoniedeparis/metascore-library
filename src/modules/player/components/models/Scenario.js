import { merge } from "lodash";
import { AbstractComponent, EmbeddableComponent } from ".";
import { createCollectionField } from "../../../../utils/jsonSchema";

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
