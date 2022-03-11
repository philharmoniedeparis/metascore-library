import { merge } from "lodash";
import { v4 as uuid } from "uuid";
import AbstractModel from "@metascore-library/core/models/AbstractModel";
import {
  createStringField,
  createBooleanField,
} from "@metascore-library/core/utils/schema";
import { createUuidField } from "../utils/schema";

export class AbstractComponent extends AbstractModel {
  static type = "AbstractComponent";

  static baseModel = AbstractModel;

  /**
   * Get a list of inheritance chain classes
   *
   * @returns {Class[]} The list of Model classes in the inheritance chain
   */
  static get modelChain() {
    let classes = [this];

    if (this.baseModel) {
      classes = classes.concat(this.baseModel.modelChain);
    }

    return classes;
  }

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        type: createStringField({
          title: "Type",
          description: "The component's type",
          const: this.type,
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

  /**
   * @inheritdoc
   */
  constructor(data) {
    if (!data.id) {
      data.id = `component-${uuid()}`;
    }

    super(data);
  }

  /**
   * Alias to the static getter modelChain
   *
   * @returns {Class[]} The list of Model classes in the inheritance chain
   */
  get $modelChain() {
    return this.constructor.modelChain;
  }
}

export default AbstractComponent;
