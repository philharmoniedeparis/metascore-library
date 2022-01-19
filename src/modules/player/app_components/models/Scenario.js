import { mix } from "mixwith";
import { merge } from "lodash";
import { AbstractComponent, EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import { createCollectionField } from "../utils/schema";

export class Scenario extends mix(AbstractComponent).with(Backgroundable) {
  static entity = "Scenario";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = super.ajv;

    return merge(super.schema, {
      properties: {
        "scenario-children": createCollectionField({
          ajv,
          model: EmbeddableComponent,
          foreign_key: "$children_ids",
        }),
      },
    });
  }
}

export default Scenario;
