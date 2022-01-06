import { Mixin } from "mixwith";
import { merge } from "lodash";
import {
  createIntegerField,
  createColorField,
  createBorderRadiusField,
} from "../../../../../utils/jsonSchema";

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
              nullable: true,
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
    }
);
