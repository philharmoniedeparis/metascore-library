import AbstractModel from "@/core/models/AbstractModel";
import {
  Scenario,
  Block,
  Page,
  VideoRenderer,
} from "@/player/models/ComponentHierarchy";
import {
  createStringField,
  createUuidField,
  createBooleanField,
} from "@/core/models/Helpers.js";
import { merge } from "@/core/utils/Object";

export class AbstractComponent extends AbstractModel {
  static entity = "AbstractComponent";

  static types() {
    return {
      Scenario,
      Block,
      Page,
      VideoRenderer,
    };
  }

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        type: createStringField({
          title: "Type",
          description: "The component's type",
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
