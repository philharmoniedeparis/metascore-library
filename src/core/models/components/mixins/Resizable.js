import {
  createArrayField,
  createIntegerField,
} from "../../../utils/JSONSchema";
import { Mixin } from "mixwith";
import { merge } from "lodash";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        return merge(super.schema, {
          properties: {
            dimension: createArrayField({
              title: "Dimension",
              default: [50, 50],
              items: [createIntegerField(), createIntegerField()],
            }),
          },
        });
      }
    }
);
