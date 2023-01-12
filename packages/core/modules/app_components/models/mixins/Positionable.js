import { Mixin } from "mixwith";
import { merge } from "lodash";
import {
  createArrayField,
  createIntegerField,
} from "@metascore-library/core/utils/schema";

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

      static get $isPositionable() {
        return true;
      }

      async update(data, ...rest) {
        if ("position" in data) {
          data.position[0] = Math.round(data.position[0]);
          data.position[1] = Math.round(data.position[1]);
        }
        return await super.update(data, ...rest);
      }
    }
);
