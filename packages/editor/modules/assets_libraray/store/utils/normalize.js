import {
  schema as _schema,
  normalize as _normalize,
  denormalize as _denormalize,
} from "normalizr";

const schema = new _schema.Array(new _schema.Entity("assets"));

export function normalize(data) {
  return _normalize(data, schema);
}

export function denormalize(input, data) {
  return _denormalize(input, data, schema);
}
