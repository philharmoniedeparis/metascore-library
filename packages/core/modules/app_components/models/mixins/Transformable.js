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
            rotate: createAnimatedField({
              ajv,
              title: "Rotate",
              default: { animated: false, value: 0 },
              items: createNumberField({
                multipleOf: 1,
              }),
            }),
          },
        });
      }

      static get $isTransformable() {
        return true;
      }

      /**
       * @inheritdoc
       */
      async update(data, ...rest) {
        ["translate", "scale", "rotate"].forEach((property) => {
          // If the last keyframe has been deleted,
          // mark the property as unanimated.
          if (
            property in data &&
            data[property].animated &&
            Array.isArray(data[property].value) &&
            data[property].value.length === 0
          ) {
            data[property] = {
              value: this[property]?.value?.[0]?.[1],
              animated: false,
            };
          }
        });

        return await super.update(data, ...rest);
      }
    }
);
