import { Mixin } from "mixwith";
import { merge, round } from "lodash";
import { createTimeField } from "@metascore-library/core/utils/schema";

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
              nullable: true,
            }),
            "end-time": createTimeField({
              ajv,
              title: "End time",
              default: null,
              nullable: true,
            }),
          },
        });
      }

      static get $isTimeable() {
        return true;
      }

      update(data, ...rest) {
        if ("start-time" in data && data["start-time"] !== null) {
          data["start-time"] = round(data["start-time"], 2);
        }
        if ("end-time" in data && data["end-time"] !== null) {
          data["end-time"] = round(data["end-time"], 2);
        }
        return super.update(data, ...rest);
      }
    }
);
