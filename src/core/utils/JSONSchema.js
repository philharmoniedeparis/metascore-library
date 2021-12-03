import Ajv from "ajv";
import { clone, merge } from "lodash";
import urlRegex from "url-regex";
import validateColor from "validate-color";

/**
 * Retreive properties from a JSON schema.
 *
 * @param {object} schema The schema
 * @param {Ajv?} validator An Ajv instance
 * @returns {object} The list of properties
 */
export const getProperties = (schema, validator = null) => {
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
};

export const createStringField = ({
  title = "",
  description = "",
  default: default_value = "",
} = {}) => {
  return {
    type: "string",
    title,
    description,
    default: default_value,
  };
};

export const createNumberField = ({
  title = "",
  description = "",
  default: default_value = 0,
  multipleOf = 0.01,
  minimum = null,
  maximum = null,
} = {}) => {
  const field = {
    type: "number",
    title,
    description,
    default: default_value,
    multipleOf,
  };

  if (minimum !== null) {
    field.minimum = minimum;
  }
  if (maximum !== null) {
    field.maximum = maximum;
  }

  return field;
};

export const createIntegerField = ({
  title = "",
  description = "",
  default: default_value = 0,
  minimum = null,
  maximum = null,
} = {}) => {
  const field = {
    type: "integer",
    title,
    description,
    default: default_value,
  };

  if (minimum !== null) {
    field.minimum = minimum;
  }
  if (maximum !== null) {
    field.maximum = maximum;
  }

  return field;
};

export const createBooleanField = ({
  title = "",
  description = "",
  default: default_value = false,
} = {}) => {
  return {
    type: "boolean",
    title,
    description,
    default: default_value,
  };
};

export const createArrayField = ({
  title = "",
  description = "",
  default: default_value = [],
  minItems = null,
  maxItems = null,
  items = null,
} = {}) => {
  const field = {
    type: "array",
    title,
    description,
    default: default_value,
  };

  if (minItems !== null) {
    field.minItems = minItems;
  }
  if (maxItems !== null) {
    field.maxItems = maxItems;
  }
  if (items !== null) {
    field.items = items;
  }

  return field;
};

export const createEnumField = ({
  title = "",
  description = "",
  default: default_value = null,
  enum: allowed_values = [],
} = {}) => {
  return {
    ...createStringField({ title, description, default: default_value }),
    enum: allowed_values,
  };
};

export const createUuidField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = "",
} = {}) => {
  ajv.addFormat("uuid", { validate: () => true });

  return {
    ...createStringField({ title, description, default: default_value }),
    format: "uuid",
  };
};

export const createUrlField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = "",
} = {}) => {
  ajv.addFormat("url", urlRegex);
  return {
    ...createStringField({ title, description, default: default_value }),
    format: "url",
  };
};

export const createCollectionField = ({
  ajv,
  title = "",
  description = "",
  model,
  foreign_key,
} = {}) => {
  ajv.addFormat("collection", { validate: () => true });
  return {
    ...createArrayField({ title, description }),
    format: "collection",
    model,
    foreign_key,
  };
};

export const createTimeField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = 0,
} = {}) => {
  ajv.addFormat("time", { validate: () => true });
  return {
    ...createNumberField({ title, description, default: default_value }),
    format: "time",
  };
};

export const createColorField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = null,
} = {}) => {
  ajv.addFormat("color", { validate: validateColor });
  return {
    type: "string",
    format: "color",
    title,
    description,
    default: default_value,
  };
};

export const createImageField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = null,
} = {}) => {
  ajv.addFormat("image", urlRegex);
  return {
    ...createStringField({ title, description, default: default_value }),
    format: "image",
  };
};

export const createAngleField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = 0,
} = {}) => {
  ajv.addFormat("angle", { validate: () => true });
  return {
    ...createIntegerField({
      title,
      description,
      default: default_value,
      minimum: 0,
      maximum: 359,
    }),
    format: "angle",
  };
};

export const createBorderRadiusField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = 0,
} = {}) => {
  ajv.addFormat("border-radius", { validate: () => true });
  return {
    ...createStringField({ title, description, default: default_value }),
    format: "border-radius",
  };
};

export const createAnimatedField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = 0,
  subfield,
} = {}) => {
  return {
    ...createArrayField({
      title,
      description,
      default: default_value,
      items: {
        type: "array",
        items: [createTimeField({ ajv }), subfield],
        minItems: 2,
        additionalItems: false,
      },
    }),
  };
};
