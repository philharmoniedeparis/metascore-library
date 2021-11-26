import urlRegex from "url-regex";

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
  return {
    type: "integer",
    title,
    description,
    default: default_value,
    minimum,
    maximum,
  };
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

export const create2DPointField = ({
  title = "",
  description = "",
  default: default_value = [0, 0],
} = {}) => {
  return {
    type: "array",
    items: [{ type: "number" }, { type: "number" }],
    minItems: 2,
    title,
    description,
    default: default_value,
  };
};

export const createEnumField = ({
  title = "",
  description = "",
  default: default_value = null,
  allowed_values,
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

export const createRelationField = ({
  ajv,
  title = "",
  description = "",
  type = "hasMany",
  model,
  foreign_key,
} = {}) => {
  if (ajv.getKeyword("relation") === false) {
    ajv.addKeyword("relation", {
      compile: function (schema) {
        return function (data) {
          // TODO
          return true;
        };
      },
    });
  }

  return {
    title,
    description,
    relation: {
      type,
      model,
      foreign_key,
    },
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
  ajv.addFormat(
    "color",
    /(#([\da-f]{3}){1,2}|(rgb|hsl)a\((\d{1,3}%?,\s?){3}(1|0|0?\.\d+)\)|(rgb|hsl)\(\d{1,3}%?(,\s?\d{1,3}%?){2}\))/
  );

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

export const createAnimatedField = ({ sub_field } = {}) => {
  const title = sub_field.title ?? "";
  const description = sub_field.description ?? "";
  const default_value = sub_field.default ?? null;

  delete sub_field.description;
  delete sub_field.title;
  delete sub_field.default;

  return {
    type: "array",
    items: {
      type: "array",
      items: [...createTimeField(), ...sub_field],
      minItems: 2,
      additionalItems: false,
    },
    title,
    description,
    default: [[0, default_value]],
  };
};
