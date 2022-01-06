import { Mixin } from "mixwith";
import { merge } from "lodash";
import { createNumberField } from "../../../../../utils/jsonSchema";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        const ajv = this.ajv;

        return merge(super.schema, {
          properties: {
            opacity: createNumberField({
              ajv,
              title: "Opacity",
              default: null,
              nullable: true,
              minimum: 0,
              maximum: 1,
            }),
          },
        });
      }
    }
);
