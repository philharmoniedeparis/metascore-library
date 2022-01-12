import { Mixin } from "mixwith";
import { merge } from "lodash";
import { createArrayField, createIntegerField } from "../../utils/schema";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        return merge(super.schema, {
          properties: {
            position: createArrayField({
              title: "Position",
              default: [0, 0],
              items: [createIntegerField(), createIntegerField()],
            }),
          },
        });
      }
    }
);
