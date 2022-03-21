import urlRegex from "url-regex";
import validateColor from "validate-color";

export const createStringField = ({
  title = "",
  description = "",
  default: default_value = "",
  nullable = false,
} = {}) => {
  return {
    type: nullable ? ["string", "null"] : "string",
    title,
    description,
    default: default_value,
  };
};

export const createNumberField = ({
  title = "",
  description = "",
  default: default_value = 0,
  nullable = false,
  multipleOf = 0.01,
  minimum = null,
  maximum = null,
} = {}) => {
  const field = {
    type: nullable ? ["number", "null"] : "number",
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
  nullable = false,
  minimum = null,
  maximum = null,
} = {}) => {
  const field = {
    type: nullable ? ["integer", "null"] : "integer",
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
  nullable = false,
} = {}) => {
  return {
    type: nullable ? ["boolean", "null"] : "boolean",
    title,
    description,
    default: default_value,
  };
};

export const createArrayField = ({
  title = "",
  description = "",
  default: default_value = [],
  nullable = false,
  minItems = null,
  maxItems = null,
  items = null,
  additionalItems = null,
  uniqueItems = null,
} = {}) => {
  const field = {
    type: nullable ? ["array", "null"] : "array",
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
  if (additionalItems !== null) {
    field.additionalItems = additionalItems;
  }
  if (uniqueItems !== null) {
    field.uniqueItems = uniqueItems;
  }

  return field;
};

export const createEnumField = ({
  title = "",
  description = "",
  default: default_value = null,
  nullable = true,
  enum: allowed_values = [],
} = {}) => {
  return {
    ...createStringField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    enum: allowed_values,
  };
};

export const createUrlField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = "",
  nullable = false,
} = {}) => {
  ajv.addFormat("url", urlRegex);
  return {
    ...createStringField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    format: "url",
  };
};

export const createTimeField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = 0,
  nullable = false,
} = {}) => {
  ajv.addFormat("time", { validate: () => true });
  return {
    ...createNumberField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    format: "time",
  };
};

export const createColorField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = null,
  nullable = true,
} = {}) => {
  ajv.addFormat("color", { validate: validateColor });
  return {
    type: nullable ? ["string", "null"] : "string",
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
  nullable = true,
} = {}) => {
  ajv.addFormat("image", urlRegex);
  return {
    ...createStringField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    format: "image",
  };
};

export const createFileField = ({
  ajv,
  title = "",
  description = "",
  multiple = false,
  nullable = true,
} = {}) => {
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
  };

  if (multiple) {
    return {
      ...createArrayField({
        items: item,
      }),
      format: "file",
    };
  } else {
    return {
      ...item,
      format: "file",
    };
  }
};
