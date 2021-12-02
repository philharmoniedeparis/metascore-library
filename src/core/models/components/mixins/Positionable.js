import {
  createArrayField,
  createIntegerField,
  createAnimatedField,
} from "../../../utils/JSONSchema";
import { Mixin } from "mixwith";
import { merge } from "lodash";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        const ajv = this.ajv;

        return merge(super.schema, {
          properties: {
            position: createArrayField({
              title: "Position",
              default: [0, 0],
              items: [createIntegerField(), createIntegerField()],
            }),
            translate: createAnimatedField({
              ajv,
              title: "Translate",
              default: [[0, [0, 0]]],
              subfield: createArrayField({
                default: [0, 0],
                items: [createIntegerField(), createIntegerField()],
              }),
            }),
          },
        });
      }
    }
);
