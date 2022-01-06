import { Mixin } from "mixwith";
import { merge } from "lodash";
import {
  createColorField,
  createImageField,
} from "../../../../../utils/jsonSchema";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        const ajv = this.ajv;

        return merge(super.schema, {
          properties: {
            "background-color": createColorField({
              ajv,
              title: "Background color",
              default: null,
              nullable: true,
            }),
            "background-image": createImageField({
              ajv,
              title: "Background image",
              default: null,
              nullable: true,
            }),
          },
        });
      }
    }
);
