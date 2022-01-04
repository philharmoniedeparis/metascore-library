import { createNumberField } from "../../../utils/jsonSchema";
import { Mixin } from "mixwith";
import { merge } from "lodash";

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
              maximum: 1,
            }),
          },
        });
      }
    }
);
