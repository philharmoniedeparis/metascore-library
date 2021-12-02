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
            dimension: createArrayField({
              title: "Dimension",
              default: [50, 50],
              items: [createIntegerField(), createIntegerField()],
            }),
            scale: createAnimatedField({
              ajv,
              title: "Scale",
              default: [[0, [1, 1]]],
              subfield: createArrayField({
                default: [1, 1],
                items: [createIntegerField(), createIntegerField()],
              }),
            }),
          },
        });
      }
    }
);
