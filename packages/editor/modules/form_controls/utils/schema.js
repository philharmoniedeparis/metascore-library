import { assign } from "lodash";

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
  });
}

/**
 * Flatten a JSON Schema
 * Credit: https://github.com/koumoul-dev/vuetify-jsonschema-form/blob/master/lib/utils/schema.js
 *
 * @param {object} schema The schema
 * @param {object} ajv An Ajv instance
 * @param {object} value The current associated value
 * @returns {object} The flattened schema
 */
export function flatten(schema, ajv, value) {
  const flattened = structuredClone(schema);

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

  // extend schema based on conditions
  if (flattened.if) {
    const valid = ajv.validate(flattened.if, value);
    if (valid && flattened.then) {
      merge(flattened, flattened.then);
    } else if (!valid && flattened.else) {
      merge(flattened, flattened.else);
    }

    delete flattened.if;
    delete flattened.then;
    delete flattened.else;
  }

  return flattened;
}
