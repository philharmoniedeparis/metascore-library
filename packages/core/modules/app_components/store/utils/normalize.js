import * as Models from "../../models";
import { cloneDeep } from "lodash";

// Get collection properties.
const collections = {};
Object.values(Models).forEach(({ name: type, schema }) => {
  Object.entries(schema.properties).forEach(([key, value]) => {
    if (value.format === "collection") {
      collections[type] = collections[type] || [];
      collections[type].push(key);
    }
  });
});

async function normalizeItem(data, entities, parent = null) {
  const item = await Models[data.type].create(data);

  if (item.type in collections) {
    for (const key of collections[item.type]) {
      if (item[key]) {
        item[key] = await Promise.all(
          item[key].map(async (child) => {
            await normalizeItem(
              {
                ...child,
              },
              entities,
              item
            );

            return {
              id: child.id,
              type: child.type,
            };
          })
        );
      }
    }
  }

  if (parent) {
    item.$parent = {
      id: parent.id,
      type: parent.type,
    };
  }

  entities[item.type] = { ...entities[item.type], [item.id]: item };
}

export async function normalize(data) {
  const entities = {};
  const result = [];

  for (const item of data) {
    await normalizeItem(item, entities);

    result.push({
      id: item.id,
      type: item.type,
    });
  }

  return { entities, result };
}

function denormalizeItem(item, all) {
  const data = cloneDeep(all[item.type][item.id].data);

  if (data.type in collections) {
    collections[data.type].forEach((key) => {
      if (data[key]) {
        data[key] = data[key].map((subitem) => {
          return denormalizeItem(subitem, all);
        });
      }
    });
  }

  return data;
}

export function denormalize(input, data) {
  return input.map((i) => {
    return denormalizeItem(i, data);
  });
}
