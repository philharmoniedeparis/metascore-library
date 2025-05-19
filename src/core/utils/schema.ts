import validateColor from "validate-color";
import type { Ajv } from "ajv";
import addFormats from "ajv-formats"
import type { JSONSchema7, JSONSchema7Array, JSONSchema7Definition, JSONSchema7Type } from "json-schema";

export class AjvRequiredError extends Error {
  constructor() {
    super("An AJV instance is required.");
  }
}

export const createStringField = ({
  title = "",
  description = "",
  default: default_value = void 0 as string|null|undefined,
  minLength = void 0 as number|undefined,
  maxLength = void 0 as number|undefined,
  nullable = false,
} = {}) => {
  const field = {
    type: nullable ? ["string", "null"] : "string",
    title,
    description,
  } as JSONSchema7;

  if (typeof default_value !== "undefined") field.default = default_value;
  if (typeof minLength !== "undefined") field.minLength = minLength;
  if (typeof maxLength !== "undefined") field.maxLength = maxLength;

  return field;
};

export const createNumberField = ({
  title = "",
  description = "",
  default: default_value = void 0 as number|null|undefined,
  nullable = false,
  multipleOf = 0.01,
  minimum = void 0 as number|undefined,
  maximum = void 0 as number|undefined,
} = {}) => {
  const field = {
    type: nullable ? ["number", "null"] : "number",
    title,
    description,
    multipleOf,
  } as JSONSchema7;

  if (typeof default_value !== "undefined") field.default = default_value;
  if (typeof minimum !== "undefined") field.minimum = minimum;
  if (typeof maximum !== "undefined") field.maximum = maximum;

  return field;
};

export const createIntegerField = ({
  title = "",
  description = "",
  default: default_value = void 0 as number|null|undefined,
  nullable = false,
  minimum = void 0 as number|undefined,
  maximum = void 0 as number|undefined,
} = {}) => {
  const field = {
    type: nullable ? ["integer", "null"] : "integer",
    title,
    description,
  } as JSONSchema7;

  if (typeof default_value !== "undefined") field.default = default_value;
  if (typeof minimum !== "undefined") field.minimum = minimum;
  if (typeof maximum !== "undefined") field.maximum = maximum;

  return field;
};

export const createBooleanField = ({
  title = "",
  description = "",
  default: default_value = void 0 as boolean|null|undefined,
  nullable = false,
} = {}) => {
  const field = {
    type: nullable ? ["boolean", "null"] : "boolean",
    title,
    description,
  } as JSONSchema7;

  if (typeof default_value !== "undefined") field.default = default_value;

  return field;
};

export const createArrayField = ({
  title = "",
  description = "",
  default: default_value = void 0 as JSONSchema7Array|null|undefined,
  nullable = false,
  minItems = void 0 as number|undefined,
  maxItems = void 0 as number|undefined,
  items = void 0 as JSONSchema7Definition|JSONSchema7Definition[]|undefined,
  additionalItems = void 0 as boolean|undefined,
  uniqueItems = void 0 as boolean|undefined,
} = {}) => {
  const field = {
    type: nullable ? ["array", "null"] : "array",
    title,
    description,
  } as JSONSchema7;

  if (typeof default_value !== "undefined") field.default = default_value;
  if (typeof minItems !== "undefined") field.minItems = minItems;
  if (typeof maxItems !== "undefined") field.maxItems = maxItems;
  if (typeof items !== "undefined") field.items = items;
  if (typeof additionalItems !== "undefined") field.additionalItems = additionalItems;
  if (typeof uniqueItems !== "undefined") field.uniqueItems = uniqueItems;

  return field;
};

export const createEnumField = ({
  title = "",
  description = "",
  enum: allowed_values = [] as JSONSchema7Type[],
  default: default_value = void 0 as JSONSchema7Type|undefined,
} = {}) => {
  const field = {
    title,
    description,
    enum: allowed_values,
  } as JSONSchema7;

  if (typeof default_value !== "undefined") field.default = default_value;

  return field;
};

export const createUrlField = ({
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  default: default_value = void 0 as string|null|undefined,
  nullable = false,
} = {}) => {
  if (!ajv) throw new AjvRequiredError();
  addFormats(ajv, ["uri-reference"]);

  return {
    ...createStringField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    format: "uri-reference",
  } as JSONSchema7;
};

export const createTimeField = ({
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  default: default_value = void 0 as number|null|undefined,
  nullable = false,
} = {}) => {
  if (!ajv) throw new AjvRequiredError();
  ajv.addFormat("time", { validate: () => true });

  return {
    ...createNumberField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    format: "time",
  } as JSONSchema7;
};

export const createColorField = ({
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  default: default_value = void 0 as string|null|undefined,
  nullable = true,
}) => {
  if (!ajv) throw new AjvRequiredError();
  ajv.addFormat("color", { validate: validateColor });

  return {
    type: nullable ? ["string", "null"] : "string",
    format: "color",
    title,
    description,
    default: default_value,
  } as JSONSchema7;
};

export const createImageField = ({
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  default: default_value = void 0 as string|null|undefined,
  nullable = true,
} = {}) => {
  if (!ajv) throw new AjvRequiredError();
  addFormats(ajv, ["uri-reference"]);

  return {
    ...createStringField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    format: "uri-reference",
  } as JSONSchema7;
};

export const createFileField = ({
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  multiple = false,
  nullable = true,
} = {}) => {
  if (!ajv) throw new AjvRequiredError();
  ajv.addFormat("file", { validate: () => true });

  const item = {
    type: nullable ? ["object", "null"] : "object",
    title,
    description,
    properties: {
      name: { type: "string" },
      size: { type: "number" },
      mime: { type: "string" },
      url: { type: "string" },
    },
  } as JSONSchema7Definition;

  return (
    multiple ?
    { ...createArrayField({ items: item }), format: "file" } :
    Object.assign(item, { format: "file" })
  ) as JSONSchema7;
};
