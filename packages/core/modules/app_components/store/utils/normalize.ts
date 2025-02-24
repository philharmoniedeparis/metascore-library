import * as Models from "../../models";

// Get collection properties.
const collections = {};
Object.values(Models).forEach(({ type, schema }) => {
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
            const normalized_child = await normalizeItem(
              {
                ...child,
              },
              entities,
              item
            );

            return {
              id: normalized_child.id,
              type: normalized_child.type,
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

  return item;
}

export async function normalize(data) {
  const entities = {};
  const result = [];

  for (const item of data) {
    const normalized_item = await normalizeItem(item, entities);

    result.push({
      id: normalized_item.id,
      type: normalized_item.type,
    });
  }

  return { entities, result };
}

function denormalizeItem(item, all) {
  if (!all?.[item.type]?.[item.id]) {
    return null;
  }

  const data = structuredClone(all[item.type][item.id].data);

  if (data.type in collections) {
    collections[data.type].forEach((key) => {
      if (data[key]) {
        data[key] = data[key]
          .map((subitem) => denormalizeItem(subitem, all))
          .filter((subitem) => subitem !== null);
      }
    });
  }

  return data;
}

export function denormalize(input, data) {
  return input
    .map((item) => denormalizeItem(item, data))
    .filter((item) => item !== null);
}
