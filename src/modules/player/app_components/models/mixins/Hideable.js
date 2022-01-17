import { Mixin } from "mixwith";
import { merge } from "lodash";
import { createBooleanField } from "../../utils/schema";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        const ajv = this.ajv;

        return merge(super.schema, {
          properties: {
            hidden: createBooleanField({
              ajv,
              title: "Hidden",
              default: false,
            }),
          },
        });
      }
    }
);