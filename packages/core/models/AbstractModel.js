import { v4 as uuid } from "uuid";
import Ajv from "ajv";
import { isString } from "lodash";
import { markRaw } from "vue";

/**
 * Retreive properties from a JSON schema.
 *
 * @param {Object} schema The schema
 * @param {Ajv?} validator An Ajv instance
 * @returns {Object} The list of properties
 */
function getProperties(schema, validator = null) {
  let properties = {};

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
    properties = { ...properties, ...schema.properties };
  }
  if (schema.then) {
    properties = { ...properties, ...getProperties(schema.then, validator) };
  }
  if (schema.else) {
    properties = { ...properties, ...getProperties(schema.else, validator) };
  }

  const defs = schema["anyOf"] || schema["allOf"] || (root && schema["oneOf"]);
  if (defs) {
    defs.forEach((def) => {
      properties = { ...properties, ...getProperties(def, validator) };
    });
  }

  return properties;
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
   * @returns {Object} The schema definition
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
   * @returns {Object} The list of properties in JSON schema format
   */
  static get properties() {
    if (!this._properties) {
      this._properties = getProperties(this.schema);
    }

    return this._properties;
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

  static create(data = {}, validate = true) {
    const instance = new this();

    if (validate) {
      return instance.update(data);
    }

    for (const [name, value] of Object.entries(data)) {
      instance[name] = value;
    }
    return instance;
  }

  constructor() {
    this._data = {};

    return new Proxy(this, {
      get(target, name) {
        if (
          isString(name) &&
          Object.prototype.hasOwnProperty.call(target.properties, name)
        ) {
          return target._data[name];
        }
        return Reflect.get(...arguments);
      },
      set(target, name, value) {
        if (
          isString(name) &&
          Object.prototype.hasOwnProperty.call(target.properties, name)
        ) {
          target._data[name] = value;
          return true;
        }
        return Reflect.set(...arguments);
      },
    });
  }

  /**
   * Alias to the static method of the same name
   *
   * @returns {Ajv} The Ajv instance
   */
  get ajv() {
    return this.constructor.ajv;
  }

  /**
   * Alias to the static method of the same name
   *
   * @returns {Object} The schema definition
   */
  get schema() {
    return this.constructor.schema;
  }

  /**
   * Alias to the static method of the same name
   *
   * @returns {Object} The list of properties in JSON schema format
   */
  get properties() {
    return this.constructor.properties;
  }

  /**
   * Get the model's data
   *
   * @returns {Object} The data
   */
  get data() {
    return this._data;
  }

  /**
   * Alias to the static method of the same name
   *
   * @param {Object} data The data to validate
   * @returns {Promise} A promise that resolves with validated data or rejects with errors
   */
  validate(data) {
    return new Promise((resolve, reject) => {
      const result = this.ajv.validate(this.schema, data);

      if (!!result && typeof result.then === "function") {
        result.then(resolve).catch((e) => {
          reject(e.errors);
        });
      } else {
        if (result) {
          resolve(data);
        } else {
          reject(this.ajv.errors);
        }
      }
    });
  }

  /**
   * Update internal data
   *
   * @param {Object} data The data to update
   * @param {boolean} [validate=true] Whether to validate the data
   * @returns {Promise<this, Error>} True if the data is valid, false otherwise
   */
  update(data, validate = true) {
    const updated = {
      ...this._data,
      ...data,
    };

    if (validate) {
      return new Promise((resolve, reject) => {
        this.validate(updated)
          .then((result) => {
            this._data = result;
            resolve(this);
          })
          .catch((errors) => {
            reject(errors);
          });
      });
    } else {
      this._data = updated;
      return this;
    }
  }
}
