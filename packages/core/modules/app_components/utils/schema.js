import { v4 as uuid } from "uuid";
import {
  createStringField,
  createArrayField,
  createIntegerField,
  createBooleanField,
  createTimeField,
} from "@metascore-library/core/utils/schema";

export function createCollectionField({
  ajv,
  title = "",
  description = "",
  model = [],
} = {}) {
  ajv.addFormat("collection", { validate: () => true });

  const types = Array.isArray(model) ? model.map((m) => m.type) : [model.type];

  return {
    ...createArrayField({
      title,
      description,
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { enum: types },
        },
      },
      uniqueItems: true,
    }),
    format: "collection",
  };
}

export function createHtmlField({
  ajv,
  title = "",
  description = "",
  default: default_value = null,
  nullable = true,
} = {}) {
  ajv.addFormat("html", { validate: () => true });
  return {
    ...createStringField({
      title,
      description,
      default: default_value,
      nullable,
    }),
    format: "html",
  };
}

export function createAngleField({
  ajv,
  title = "",
  description = "",
  default: default_value = 0,
  nullable = true,
} = {}) {
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
}

export function createBorderRadiusField({
  ajv,
  title = "",
  description = "",
  default: default_value = 0,
  nullable = false,
} = {}) {
  ajv.addFormat("border-radius", { validate: () => true });
  return {
    type: nullable ? ["string", "integer", "null"] : ["string", "integer"],
    title,
    description,
    default: default_value,
    format: "border-radius",
  };
}

export function createAnimatedField({
  ajv,
  title = "",
  description = "",
  default: default_value = { animated: false, value: null },
  nullable = false,
  items,
} = {}) {
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
      $id: uuid(), // Used for Ajv caching.
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
}
