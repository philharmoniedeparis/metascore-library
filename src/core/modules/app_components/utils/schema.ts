import { v4 as uuid } from "uuid";
import type { Ajv } from "ajv";
import {
  createStringField,
  createArrayField,
  createIntegerField,
  createBooleanField,
  createTimeField,
  AjvRequiredError,
} from "@core/utils/schema";
import type { JSONSchema7Definition } from "json-schema";
import type { AbstractComponent } from "../models";

export function createCollectionField({
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  models = [] as typeof AbstractComponent[],
} = {}) {
  if (!ajv) throw new AjvRequiredError();
  ajv.addFormat("collection", { validate: () => true });

  return {
    ...createArrayField({
      title,
      description,
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { enum: models.map((m) => m.type) },
        },
      },
      uniqueItems: true,
    }),
    format: "collection",
  };
}

export function createHtmlField({
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  default: default_value = void 0 as string|undefined,
  nullable = true,
} = {}) {
  if (!ajv) throw new AjvRequiredError();
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
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  default: default_value = 0,
  nullable = true,
} = {}) {
  if (!ajv) throw new AjvRequiredError();
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
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  default: default_value = 0 as string|number|null|undefined,
  nullable = false,
} = {}) {
  if (!ajv) throw new AjvRequiredError();
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
  ajv = void 0 as Ajv|undefined,
  title = "",
  description = "",
  default: default_value = { animated: false, value: null } as { animated: boolean, value: unknown },
  nullable = false,
  items = [] as JSONSchema7Definition,
} = {}) {
  if (!ajv) throw new AjvRequiredError();
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
