import { assign, cloneDeep } from "lodash";

/**
 * Merge one or more sub-schemas into the root JSON Schema
 * Credit: https://github.com/koumoul-dev/vuetify-jsonschema-form/blob/master/lib/utils/schema.js
 *
 * @param {object} schema The root schema
 * @param  {...object} subSchemas The sub-schemas
 */
export function merge(schema, ...subSchemas) {
  subSchemas.forEach((subSchema) => {
    if (subSchema.properties) {
      schema.properties = assign(schema.properties, subSchema.properties);
    }

    if (subSchema.required) {
      schema.required = (schema.required || []).concat(subSchema.required);
    }

    if (subSchema.oneOf) {
      schema.oneOf = (schema.oneOf || []).concat(subSchema.oneOf);
    }
    if (subSchema.allOf) {
      schema.allOf = (schema.allOf || []).concat(subSchema.allOf);
    }

    if (subSchema.if) {
      schema.if = assign(schema.if || {}, subSchema.if);
    }
    if (subSchema.then) {
      schema.then = assign(schema.then || {}, subSchema.then);
    }
    if (subSchema.else) {
      schema.else = assign(schema.else || {}, subSchema.else);
    }
  });
}

/**
 * Flatten if/then/else conditions recursively
 *
 * @param {object} schema The schema
 * @param {object} ajv An Ajv instance
 * @param {object} value The current associated value
 */
function flattenConditions(schema, ajv, value) {
  if (schema.if) {
    const { if: _if, then: _then, else: _else } = schema;

    delete schema.if;
    delete schema.then;
    delete schema.else;

    const validate = _if.$id
      ? ajv.getSchema(_if.$id) || ajv.compile(_if)
      : ajv.compile(_if);
    const valid = validate(value);
    if (valid && _then) {
      merge(schema, _then);
    } else if (!valid && _else) {
      merge(schema, _else);
    }

    flattenConditions(schema, ajv, value);
  }
}

/**
 * Flatten a JSON Schema
 * Credit: https://github.com/koumoul-dev/vuetify-jsonschema-form/blob/master/lib/utils/schema.js
 *
 * @param {object} schema The schema
 * @param {object} ajv An Ajv instance
 * @param {object} value The current associated value
 * @param {boolean} recursive Whether to flatten sub-object properties
 * @returns {object} The flattened schema
 */
export function flatten(schema, ajv, value, recursive = false) {
  const flattened = cloneDeep(schema);

  if (!flattened.type) {
    const combination = flattened.anyOf || flattened.oneOf || flattened.allOf;
    const typedCombinationItem =
      combination && combination.find((c) => !!c.type);
    if (typedCombinationItem) {
      flattened.type = typedCombinationItem.type;
    }
  }

  // manage null type in an array, for example ['string', 'null']
  if (Array.isArray(flattened.type)) {
    flattened.nullable = flattened.type.includes("null");
    flattened.type = flattened.type.find((t) => t !== "null");
    if (flattened.type.length === 1) {
      flattened.type = flattened.type[0];
    }
    if (flattened.nullable && flattened.enum) {
      flattened.enum = flattened.enum.filter((v) => v !== null);
    }
  }

  flattenConditions(flattened, ajv, value);

  if (recursive && flattened.properties) {
    for (const property in flattened.properties) {
      flattened.properties[property] = flatten(
        flattened.properties[property],
        ajv,
        value?.[property],
        true
      );
    }
  }

  return flattened;
}
