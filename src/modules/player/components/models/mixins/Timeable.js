import { Mixin } from "mixwith";
import { merge } from "lodash";
import { createTimeField } from "../../../../../utils/jsonSchema";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        const ajv = this.ajv;

        return merge(super.schema, {
          properties: {
            "start-time": createTimeField({
              ajv,
              title: "Start time",
              default: null,
            }),
            "end-time": createTimeField({
              ajv,
              title: "End time",
              default: null,
            }),
          },
        });
      }
    }
);
