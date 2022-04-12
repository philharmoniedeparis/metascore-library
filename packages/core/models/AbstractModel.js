import { v4 as uuid } from "uuid";
import Ajv from "ajv";
import { clone, merge } from "lodash";
import { markRaw } from "vue";

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
 * An abstract model based {@link http://json-schema.org/|JSON schema}
 * Heavily inspired by {@link https://github.com/chialab/schema-model|schema-model},
 * and uses {@link https://ajv.js.org/|AJV} for shcema validation.
 *
 * @abstract
 */
export default class AbstractModel {
  /**
   * Get the ajv instance.
   *
   * @returns {Ajv} The Ajv instance
   */
  static get ajv() {
    if (!this._ajv) {
      this._ajv = new Ajv({
        allErrors: true,
        verbose: true,
        strict: false,
        useDefaults: true,
        multipleOfPrecision: 2,
      });

      markRaw(this._ajv);
    }

    return this._ajv;
  }

  /**
   * Get the JSON Schema definition for this model
   *
   * @returns {object} The schema definition
   */
  static get schema() {
    return {
      $id: uuid(), // Used for Ajv caching.
      type: "object",
      properties: {},
      unevaluatedProperties: false,
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
   * Validate data against the schema.
   *
   * @param {object} data The data to validate
   * @returns {boolean} True if the data is valid, false otherwise
   */
  static async validate(data) {
    return await this.ajv.validate(this.schema, data);
  }

  /**
   * Get current validation errors.
   */
  static get errors() {
    return this.ajv.errors;
  }

  /**
   * Get the list of required properties from the schema.
   *
   * @returns {string[]} The list of required properties
   */
  static get requiredProperties() {
    return this.schema.required;
  }

  static async create(data = {}, validate = true) {
    if (validate) {
      const valid = await this.validate(data);
      if (!valid) {
        console.error(this.$errors);
        return null;
      }
    }

    return new this(data);
  }

  constructor(data = {}) {
    Object.entries(data).forEach(([key, value]) => {
      this[key] = value;
    });
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
   * Get the model's data
   *
   * @returns {object} The data
   */
  get $data() {
    const data = {};

    Object.keys(this.$properties).forEach((key) => {
      if (key in this) {
        data[key] = this[key];
      }
    });

    return data;
  }

  /**
   * Get current validation errors.
   */
  get $errors() {
    return this.$ajv.errors;
  }

  async update(data) {
    if (
      await this.validate({
        ...this.$data,
        ...data,
      })
    ) {
      Object.entries(data).forEach(([key, value]) => {
        this[key] = value;
      });
    } else {
      console.error(this.$errors);
    }
  }

  /**
   * Alias to the static method of the same name
   *
   * @param {object} data The data to validate
   * @returns {boolean} True if the data is valid, false otherwise
   */
  async validate(data) {
    return await this.constructor.validate(data);
  }
}
