import Ajv from "ajv";
import { Model } from "@vuex-orm/core";
import { clone } from "@/core/utils/Var";
import { merge, omitBy } from "lodash";

/**
 * Helper function to get retreive properties from a JSON schema.
 *
 * @param {object} schema The schema
 * @param {Ajv?} validator An Ajv instance
 * @returns {object} The list of properties
 */
function getProperties(schema, validator = null) {
  let root = !validator;
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
  let defs = schema["anyOf"] || schema["allOf"] || (root && schema["oneOf"]);
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
    if (!this._ajv) {
      this._ajv = new Ajv();
    }

    return this._ajv;
  }

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
    if (!model.validate()) {
      console.error(model.errors);
      return false;
    }
  }

  static beforeUpdate(model) {
    if (!model.validate()) {
      console.error(model.errors);
      return false;
    }
  }

  /**
   * Alias to the static method of the same name
   *
   * @returns {object} The list of properties in JSON schema format
   */
  get properties() {
    return this.constructor.properties;
  }

  /**
   * Get the schema validator.
   *
   * @returns {Function} A validation function returned by Ajv
   */
  get validator() {
    if (!this._validator) {
      this._validator = this.constructor.ajv.compile(this.constructor.schema);
    }

    return this._validator;
  }

  get errors() {
    return this.validator.errors;
  }

  $toJson() {
    const internal_fields = [];
    for (const schema of Object.values(this.properties)) {
      if (
        schema.type === "array" &&
        schema.format === "collection" &&
        "foreign_key" in schema
      ) {
        internal_fields.push(schema.foreign_key);
      }
    }

    return omitBy(super.$toJson(), (value, key) => {
      return value === null || internal_fields.includes(key);
    });
  }

  /**
   * Validate data.
   *
   * @param {object} data The data to validate
   * @returns {boolean} True if the data is valid, false otherwise
   */
  validate() {
    return this.validator(this.$toJson());
  }
}
