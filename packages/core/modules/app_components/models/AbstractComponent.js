import { merge, kebabCase } from "lodash";
import { computed, unref } from "vue";
import { v4 as uuid } from "uuid";
import AbstractModel from "@core/models/AbstractModel";
import { createStringField, createBooleanField } from "@core/utils/schema";
import useStore from "../store";

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
  static create(data = {}, ...rest) {
    return super.create({ id: `component-${uuid()}`, ...data }, ...rest);
  }

  /**
   * @inheritdoc
   */
  constructor() {
    const proxy = super();

    /**
     * @var {Array} _sorted_overrides
     * @private
     * */
    this._sorted_overrides = computed(() => {
      const { overridesEnabled, getOverrides } = useStore();
      if (overridesEnabled) {
        const overrides = getOverrides(this);
        if (overrides) {
          return Array.from(overrides.values())
            .sort((o1, o2) => o1.priority > o2.priority)
            .map((o) => o.values);
        }
      }

      return [];
    });

    return proxy;
  }

  /**
   * @inheritdoc
   */
  getPropertyValue(name) {
    if (!["type", "id"].includes(name)) {
      for (const overrides of unref(this._sorted_overrides)) {
        if (Object.prototype.hasOwnProperty.call(overrides, name)) {
          return overrides[name];
        }
      }
    }

    return this._data[name];
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
