import {
  schema as _schema,
  normalize as _normalize,
  denormalize as _denormalize,
} from "normalizr";

const componentSchema = new _schema.Entity(
  "components",
  {},
  {
    processStrategy: (entity, parent, key) => {
      switch (key) {
        case "children":
          return { ...entity, parent: parent.id };
        case "pages":
          return { ...entity, parent: parent.id };
        default:
          return { ...entity };
      }
    },
  }
);
componentSchema.define({
  pages: [componentSchema],
  children: [componentSchema],
});

const schema = new _schema.Array(componentSchema);

export function normalize(data) {
  return _normalize(data, schema);
}

export function denormalize(input, data) {
  return _denormalize(input, data, schema);
}
