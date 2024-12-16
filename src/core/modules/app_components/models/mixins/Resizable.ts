import { Mixin } from "mixwith";
import { merge } from "lodash";
import { createArrayField, createIntegerField } from "@core/utils/schema";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        return merge(super.schema, {
          properties: {
            dimension: createArrayField({
              title: "Dimension",
              default: [50, 50],
              items: [
                createIntegerField({
                  minimum: 1,
                }),
                createIntegerField({
                  minimum: 1,
                }),
              ],
            }),
          },
        });
      }

      static get $isResizable() {
        return true;
      }

      async update(data, ...rest) {
        if ("dimension" in data) {
          data.dimension[0] = Math.round(data.dimension[0]);
          data.dimension[1] = Math.round(data.dimension[1]);
        }
        return await super.update(data, ...rest);
      }
    }
);
