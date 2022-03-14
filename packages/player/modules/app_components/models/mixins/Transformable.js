import { Mixin } from "mixwith";
import { merge } from "lodash";
import {
  createArrayField,
  createNumberField,
  createIntegerField,
} from "@metascore-library/core/utils/schema";
import { createAnimatedField } from "../../utils/schema";

export default Mixin(
  (superclass) =>
    class extends superclass {
      static get schema() {
        const ajv = this.ajv;

        return merge(super.schema, {
          properties: {
            translate: createAnimatedField({
              ajv,
              title: "Translate",
              default: { animated: false, value: [0, 0] },
              items: createArrayField({
                items: [createIntegerField(), createIntegerField()],
              }),
            }),
            scale: createAnimatedField({
              ajv,
              title: "Scale",
              default: { animated: false, value: [1, 1] },
              items: createArrayField({
                items: [createNumberField(), createNumberField()],
              }),
            }),
          },
        });
      }

      static get $isTransformable() {
        return true;
      }
    }
);
