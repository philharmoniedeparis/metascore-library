import { merge } from "lodash";
import AbstractModel from "../../../../models/AbstractModel";
import * as Components from ".";
import {
  createStringField,
  createUuidField,
  createBooleanField,
} from "../utils/schema";

export class AbstractComponent extends AbstractModel {
  static entity = "AbstractComponent";

  static types() {
    return {
      Page: Components.Page,
      Scenario: Components.Scenario,
    };
  }

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        type: createStringField({
          title: "Type",
          description: "The component's type",
          const: this.entity,
        }),
        id: createUuidField({
          ajv,
          title: "ID",
          description: "The component's unique identifier",
        }),
        name: createStringField({
          title: "Name",
          description: "The component's name",
        }),
        // @TODO: move to seperate data model in editor
        editor: {
          type: "object",
          properties: {
            locked: createBooleanField({
              title: "Locked",
              default: false,
            }),
          },
          additionalProperties: false,
        },
      },
      required: ["type", "id"],
    });
  }
}

export default AbstractComponent;