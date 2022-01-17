import Ajv from "ajv";
import { Model } from "@vuex-orm/core";
import { clone, merge, omitBy } from "lodash";

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  useDefaults: true,
  multipleOfPrecision: 2,
});

/**
 * Retreive properties from a JSON schema.
 *
 * @param {object} schema The schema
 * @param {Ajv?} validator An Ajv instance
 * @returns {object} The list of properties
 */
function getProperties(schema, validator = null) {
  const root = !validator;
  if (root) {
    validator = new Ajv();
    validator.addSchema(schema);
  }
  if (schema.definitions) {
    Object.entries(schema.definitions).forEach(([k, d]) => {
      validator.addSchema(d, `#/definitions/${k}`);
    });
  }
  if (schema.$ref) {
    schema = validator.getSchema(schema.$ref).schema;
  }
  if (schema.properties) {
    return clone(schema.properties);
  }
  let res = {};
  const defs = schema["anyOf"] || schema["allOf"] || (root && schema["oneOf"]);
  if (defs) {
    defs.forEach((def) => {
      res = merge(res, getProperties(def, validator));
    });
  }
  return res;
}

/**
 * An abstract model based on {@link https://vuex-orm.org/|@vuex-orm} and {@link http://json-schema.org/|JSON schema}
 * Heavily inspired by {@link https://github.com/chialab/schema-model|schema-model},
 * and uses {@link https://ajv.js.org/|AJV} for shcema validation.
 *
 * @abstract
 */
export default class AbstractModel extends Model {
  /**
   * Get the ajv instance.
   *
   * @returns {Ajv} The Ajv instance
   */
  static get ajv() {
    return ajv;
  }

  /**
   * Get a list of inheritance chain classes
   *
   * @returns {Class[]} The list of Model classes in the inheritance chain
   */
  static getModelChain() {
    let classes = [this];

    if (this.baseEntity) {
      const baseModel = this.store().$db().model(this.baseEntity);
      if (baseModel) {
        classes = classes.concat(baseModel.getModelChain());
      }
    }

    return classes;
  }

  /**
   * Get the JSON Schema definition for this model
   *
   * @returns {object} The schema definition
   */
  static get schema() {
    return {
      type: "object",
      properties: {},
      additionalProperties: false,
    };
  }

  /**
   * Get all properties from the schema
   * with all definitions merged.
   *
   * @returns {object} The list of properties in JSON schema format
   */
  static get properties() {
    return getProperties(this.schema);
  }

  /**
   * Get the list of required properties from the schema.
   *
   * @returns {string[]} The list of required properties
   */
  static get requiredProperties() {
    return this.schema.required;
  }

  /**
   * @inheritdoc
   */
  static fields() {
    const fields = {};

    for (const [key, schema] of Object.entries(this.properties)) {
      switch (schema.type) {
        case "array":
          if (schema.format === "collection") {
            const model = schema.model;
            const foreign_key = schema.foreign_key;
            fields[key] = this.hasManyBy(model, foreign_key);
            fields[foreign_key] = this.attr([]);
          } else {
            fields[key] = this.attr(schema.default);
          }
          break;

        case "boolean":
          fields[key] = this.boolean(schema.default);
          break;

        case "string":
          if (schema.format === "uuid") {
            fields[key] = this.uid(schema.default);
          } else {
            fields[key] = this.string(schema.default);
          }
          break;

        default:
          fields[key] = this.attr(schema.default);
      }

      if (fields[key].nullable && !this.requiredProperties.includes(key)) {
        fields[key].nullable();
      }
    }

    return fields;
  }

  static beforeCreate(model) {
    if (!model.$validate()) {
      console.error(model.$errors, model.$schema, model.$data);
      return false;
    }
  }

  static beforeUpdate(model) {
    if (!model.$validate()) {
      console.error(model.$errors, model.$schema, model.$data);
      return false;
    }
  }

  /**
   * Alias to the static method of the same name
   *
   * @returns {Ajv} The Ajv instance
   */
  get $ajv() {
    return this.constructor.ajv;
  }

  /**
   * Alias to the static method getModelChain
   *
   * @returns {Class[]} The list of Model classes in the inheritance chain
   */
  get $modelChain() {
    return this.constructor.getModelChain();
  }

  /**
   * Alias to the static method of the same name
   *
   * @returns {object} The schema definition
   */
  get $schema() {
    return this.constructor.schema;
  }

  /**
   * Alias to the static method of the same name
   *
   * @returns {object} The list of properties in JSON schema format
   */
  get $properties() {
    return this.constructor.properties;
  }

  /**
   * Get the schema validator.
   *
   * @returns {Function} A validation function returned by Ajv
   */
  get $validator() {
    if (!this._$validator) {
      this._$validator = this.$ajv.compile(this.$schema);
    }

    return this._$validator;
  }

  /**
   * Get current validation errors.
   */
  get $errors() {
    return this.$validator.errors;
  }

  /**
   * Get the data as a JSON without private properties.
   *
   * @returns {object} The data
   */
  get $data() {
    return omitBy(this.$toJson(), (value, key) => {
      return value === null || key.startsWith("$");
    });
  }

  /**
   * Validate data against the schema.
   *
   * @param {object} data The data to validate
   * @returns {boolean} True if the data is valid, false otherwise
   */
  $validate() {
    return this.$validator(this.$data);
  }
}