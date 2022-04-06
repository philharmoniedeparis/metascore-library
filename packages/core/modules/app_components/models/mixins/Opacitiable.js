import { Mixin } from "mixwith";
import { merge } from "lodash";
import { createNumberField } from "@metascore-library/core/utils/schema";
import { createAnimatedField } from "../../utils/schema";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        const ajv = this.ajv;

        return merge(super.schema, {
          properties: {
            opacity: createAnimatedField({
              ajv,
              title: "Opacity",
              default: { animated: false, value: 1 },
              items: createNumberField({
                minimum: 0,
                maximum: 1,
              }),
            }),
          },
        });
      }

      static get $isOpacitable() {
        return true;
      }
    }
);
