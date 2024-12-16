import Ajv, { type AnySchemaObject, type AnySchema } from "ajv";
import { isString } from "lodash";
import { markRaw, reactive, type Reactive } from "vue";

/**
 * The global Ajv instance.
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
 */
function getProperties(schema: AnySchemaObject, _validator?: Ajv) {
  const root = !_validator;
  let properties = {};

  let validator = _validator;
  if (!validator) {
    validator = new Ajv();
    validator.addSchema(schema);
  }

  if (schema.definitions) {
    Object.entries(schema.definitions).forEach(([k, d]) => {
      validator.addSchema(d as AnySchema, `#/definitions/${k}`);
    });
  }
  if (schema.$ref) {
    schema = validator.getSchema(schema.$ref)!.schema as AnySchemaObject;
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
    defs.forEach((def: AnySchemaObject) => {
      properties = { ...properties, ...getProperties(def, validator) };
    });
  }

  return properties;
}

type Properties = {[x: string]: unknown}
type Data = {[x: string]: unknown}

/**
 * An abstract model based {@link http://json-schema.org/|JSON schema}
 * Heavily inspired by {@link https://github.com/chialab/schema-model|schema-model},
 * and uses {@link https://ajv.js.org/|AJV} for shcema validation.
 *
 * @abstract
 */
export default class AbstractModel {
  static #properties: Properties;

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
   */
  static get schema(): AnySchemaObject {
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
   */
  static get properties() {
    if (!this.#properties) {
      this.#properties = getProperties(this.schema);
    }

    return this.#properties;
  }

  /**
   * Get the list of required properties from the schema.
   */
  static get requiredProperties(): string[]|undefined {
    return this.schema.required;
  }

  /**
   * Get the validation function.
   */
  static get validate() {
    return _ajv.getSchema(this.schemaId) || _ajv.compile(this.schema);
  }

  /**
   * Create a model instance.
   * @param data The data to initilize the model with.
   * @param validate Whether to validate the data.
   */
  static create(data:Data = {}, validate = true) {
    const instance = new this();
    return instance.update(data, validate);
  }

  #data: Reactive<Data> = reactive({});

  constructor() {
    return new Proxy(this, {
      get(target, propertyKey, ...args) {
        if (
          isString(propertyKey) &&
          Object.prototype.hasOwnProperty.call(target.properties, propertyKey)
        ) {
          return target.getPropertyValue(propertyKey);
        }
        return Reflect.get(target, propertyKey, ...args);
      },
      set(target, propertyKey, value, ...args) {
        if (
          isString(propertyKey) &&
          Object.prototype.hasOwnProperty.call(target.properties, propertyKey)
        ) {
          target.setPropertyValue(propertyKey, value);
          return true;
        }
        return Reflect.set(target, propertyKey, value, ...args);
      },
    });
  }

  /**
   * Alias to the static method of the same name
   */
  get ajv() {
    return _ajv;
  }

  /**
   * Alias to the static method of the same name
   */
  get schema() {
    return (this.constructor as typeof AbstractModel).schema;
  }

  /**
   * Alias to the static method of the same name
   */
  get properties() {
    return (this.constructor as typeof AbstractModel).properties;
  }

  /**
   * Get the model's data
   */
  get data() {
    return this.#data;
  }

  /**
   * Get the value of a property
   */
  getPropertyValue(name: string) {
    return this.#data[name];
  }

  /**
   * Set the value of a property
   */
  setPropertyValue(name: string, value: unknown) {
    this.#data[name] = value;
  }

  /**
   * Validate data against the schema.
   */
  validate(data: Data): Promise<Data> {
    const staticValidate = (this.constructor as typeof AbstractModel).validate

    return new Promise((resolve, reject) => {
      const result = staticValidate(data) as boolean|Promise<Data>;

      if (typeof result == "boolean") {
        if (result) resolve(data);
        else reject(staticValidate.errors);
      }
      else {
        result.then(resolve).catch((e) => {
          reject(e.errors);
        });
      }
    });
  }

  /**
   * Update internal data
   *
   * @param data The data to update
   * @param validate Whether to validate the data
   */
  update(data: Data, validate = true): this|Promise<this> {
    if (validate) {
      const updated = {
        ...this.#data,
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
