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

export const createUuidField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = "",
  nullable = false,
} = {}) => {
  ajv.addFormat("uuid", { validate: () => true });

  return {
    ...createStringField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    format: "uuid",
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

export const createCollectionField = ({
  ajv,
  title = "",
  description = "",
} = {}) => {
  ajv.addFormat("collection", { validate: () => true });

  // @TODO: reference sub-schemas ?

  return {
    ...createArrayField({
      title,
      description,
      items: { type: "string" },
      uniqueItems: true,
    }),
    format: "collection",
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

export const createHtmlField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = null,
  nullable = true,
} = {}) => {
  ajv.addFormat("html", urlRegex);
  return {
    ...createStringField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    format: "html",
  };
};

export const createAngleField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = 0,
  nullable = true,
} = {}) => {
  ajv.addFormat("angle", { validate: () => true });
  return {
    ...createIntegerField({
      title,
      description,
      default: default_value,
      nullable,
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
  nullable = false,
} = {}) => {
  ajv.addFormat("border-radius", { validate: () => true });
  return {
    type: nullable ? ["string", "integer", "null"] : ["string", "integer"],
    title,
    description,
    default: default_value,
    format: "border-radius",
  };
};

export const createAnimatedField = ({
  ajv,
  title = "",
  description = "",
  default: default_value = { animated: false, value: null },
  nullable = false,
  items,
} = {}) => {
  ajv.addFormat("animated", { validate: () => true });
  return {
    type: nullable ? ["object", "null"] : ["object"],
    title,
    description,
    properties: {
      animated: createBooleanField({
        title: "Animated",
        description: "Whether the value is animated.",
        default: false,
      }),
    },
    if: {
      properties: {
        animated: {
          const: false,
        },
      },
    },
    then: {
      properties: {
        value: items,
      },
    },
    else: {
      properties: {
        value: createArrayField({
          items: {
            type: "array",
            items: [createTimeField({ ajv }), items],
          },
        }),
      },
    },
    default: default_value,
    format: "animated",
  };
};
