import { Mixin } from "mixwith";
import { merge } from "lodash";
import {
  createIntegerField,
  createColorField,
} from "@metascore-library/core/utils/schema";
import { createBorderRadiusField } from "../../utils/schema";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        const ajv = this.ajv;

        return merge(super.schema, {
          properties: {
            "border-width": createIntegerField({
              title: "Border width",
              default: 0,
              minimum: 0,
            }),
            "border-color": createColorField({
              ajv,
              title: "Border color",
              default: null,
              nullable: true,
            }),
            "border-radius": createBorderRadiusField({
              ajv,
              title: "Border radius",
              default: null,
              nullable: true,
            }),
          },
        });
      }

      static get $isBorderable() {
        return true;
      }

      async update(data, ...rest) {
        if ("border-width" in data) {
          data["border-width"] = Math.round(data["border-width"]);
        }
        return await super.update(data, ...rest);
      }
    }
);
