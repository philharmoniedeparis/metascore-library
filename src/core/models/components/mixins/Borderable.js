import {
  createIntegerField,
  createColorField,
  createBorderRadiusField,
} from "../../../utils/JSONSchema";
import { Mixin } from "mixwith";
import { merge } from "lodash";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        const ajv = this.ajv;

        return merge(super.schema, {
          properties: {
            "border-width": createIntegerField({
              title: "Border width",
              default: null,
            }),
            "border-color": createColorField({
              ajv,
              title: "Border color",
              default: null,
            }),
            "border-radius": createBorderRadiusField({
              ajv,
              title: "Border radius",
              default: null,
            }),
          },
        });
      }
    }
);
