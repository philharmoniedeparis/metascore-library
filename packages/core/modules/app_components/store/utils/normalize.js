import { isObject } from "lodash";
import {
  schema as _schema,
  normalize as _normalize,
  denormalize as _denormalize,
} from "normalizr";
import * as Models from "../../models";

const schemas = {};

Object.values(Models).forEach(({ name: type }) => {
  switch (type) {
    case "AbstractComponent":
    case "EmbeddableComponent":
      break;

    default:
      schemas[type] = new _schema.Entity(
        type,
        {},
        {
          processStrategy: (entity, parent, key) => {
            // Validate and assign defualts.
            const model = Models[entity.type];
            if (!model.validate(entity)) {
              console.error(model.errors);
            }

            if (
              parent &&
              Models[parent.type]?.schema?.properties?.[key]?.format ===
                "collection"
            ) {
              // Add reference to parent entity via "parent" property.
              return {
                ...entity,
                $parent: { id: parent.id, schema: parent.type },
              };
            }

            return { ...entity };
          },
        }
      );
      break;
  }
});

// Map collection properties to schema references.
Object.values(Models).forEach(({ name: type, schema }) => {
  Object.entries(schema.properties).forEach(([key, value]) => {
    if (value.format === "collection") {
      const mapping = {};
      value.items.properties.schema.enum.forEach((related_type) => {
        mapping[related_type] = schemas[related_type];
      });
      schemas[type].define({
        [key]: new _schema.Array(mapping, "type"),
      });
    }
  });
});

const schema = new _schema.Array(schemas, "type");

export function normalize(data) {
  return _normalize(data, schema);
}

function postDenormalize(data) {
  for (const key in data) {
    if (key === "$parent") {
      delete data.$parent;
    } else if (isObject(data[key])) {
      postDenormalize(data[key]);
    }
  }
}

export function denormalize(input, data) {
  const denormalized = _denormalize(input, schema, data);
  postDenormalize(denormalized);
  return denormalized;
}
