import Ajv from "ajv";
import { isString } from "lodash";
import { markRaw, reactive } from "vue";

/**
 * @type {Ajv} The global Ajv instance.
 */
const _ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  useDefaults: true,
  multipleOfPrecision: 2,
});
markRaw(_ajv);

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
   * Get the AJV instance.
   *
   * @returns {Ajv} The Ajv instance
   */
  static get ajv() {
    return _ajv;
  }

  /**
   * Get the Schema identifier.
   *
   * @returns {String} The schema identifier
   */
  static get schemaId() {
    return "abstract-model";
  }

  /**
   * Get the JSON Schema definition for this model
   *
   * @returns {Object} The schema definition
   */
  static get schema() {
    return {
      $id: this.schemaId,
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
   * Get the list of required properties from the schema.
   *
   * @returns {string[]} The list of required properties
   */
  static get requiredProperties() {
    return this.schema.required;
  }

  /**
   * Get the validation function.
   *
   * @returns {Function} The data validation function.
   */
  static get validate() {
    return _ajv.getSchema(this.schemaId) || _ajv.compile(this.schema);
  }

  static create(data = {}, validate = true) {
    const instance = new this();
    return instance.update(data, validate);
  }

  constructor() {
    this._data = reactive({});

    return new Proxy(this, {
      get(target, name) {
        if (
          isString(name) &&
          Object.prototype.hasOwnProperty.call(target.properties, name)
        ) {
          return target.getPropertyValue(name);
        }
        return Reflect.get(...arguments);
      },
      set(target, name, value) {
        if (
          isString(name) &&
          Object.prototype.hasOwnProperty.call(target.properties, name)
        ) {
          target.setPropertyValue(name, value);
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
    return _ajv;
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
   * Get the value of a property
   *
   * @param {string} name The property name
   * @returns {*} The assosiated value
   */
  getPropertyValue(name) {
    return this._data[name];
  }

  /**
   * Set the value of a property
   *
   * @param {string} name The property name
   * @param {*} value The value
   */
  setPropertyValue(name, value) {
    this._data[name] = value;
  }

  /**
   * Validate data against the schema.
   *
   * @param {Object} data The data to validate
   * @returns {Promise} A promise that resolves with validated data or rejects with errors
   */
  validate(data) {
    return new Promise((resolve, reject) => {
      const result = this.constructor.validate(data);

      if (!!result && typeof result.then === "function") {
        result.then(resolve).catch((e) => {
          reject(e.errors);
        });
      } else {
        if (result) {
          resolve(data);
        } else {
          reject(this.constructor.validate.errors);
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
    if (validate) {
      const updated = {
        ...this._data,
        ...data,
      };
      return new Promise((resolve, reject) => {
        this.validate(updated)
          .then((result) => {
            Object.assign(this, result);
            resolve(this);
          })
          .catch((errors) => {
            reject(errors);
          });
      });
    } else {
      Object.assign(this, data);
      return this;
    }
  }
}
