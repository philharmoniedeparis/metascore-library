import { merge, kebabCase } from "lodash";
import { v4 as uuid } from "uuid";
import AbstractModel from "@metascore-library/core/models/AbstractModel";
import {
  createStringField,
  createBooleanField,
} from "@metascore-library/core/utils/schema";

export default class AbstractComponent extends AbstractModel {
  /**
   * The model's base class
   */
  static baseModel = AbstractModel;

  /**
   * The component's type
   */
  static type = "AbstractComponent";

  /**
   * @inheritdoc
   */
  static get schemaId() {
    return `app-components:${this.type}`;
  }

  /**
   * The component's children property
   */
  static childrenProperty = null;

  /**
   * The component's mime type.
   * Mainly used for drag'n'drop events.
   */
  static get mime() {
    return `metascore/component;type=${kebabCase(this.type)}`;
  }

  /**
   * Get a list of inheritance chain classes
   *
   * @returns {Class[]} The list of Model classes in the inheritance chain
   */
  static get modelChain() {
    let classes = [this];

    if (this.baseModel?.modelChain) {
      classes = classes.concat(this.baseModel.modelChain);
    }

    return classes;
  }

  /**
   * @inheritdoc
   */
  static get schema() {
    return merge(super.schema, {
      properties: {
        type: {
          ...createStringField({
            title: "Type",
            description: "The component's type",
            default: this.type,
          }),
          const: this.type,
        },
        id: createStringField({
          title: "ID",
          description: "The component's unique identifier",
          default: `component-${uuid()}`,
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
   * Alias to the static getter modelChain
   *
   * @returns {Class[]} The list of Model classes in the inheritance chain
   */
  get $modelChain() {
    return this.constructor.modelChain;
  }
}
