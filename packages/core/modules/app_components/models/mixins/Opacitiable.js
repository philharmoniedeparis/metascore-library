import { Mixin } from "mixwith";
import { merge, round } from "lodash";
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

      /**
       * @inheritdoc
       */
      async update(data, ...rest) {
        if ("opacity" in data) {
          if (data.opacity.animated && Array.isArray(data.opacity.value)) {
            if (data.opacity.value.length === 0) {
              // If the last keyframe has been deleted,
              // mark the property as unanimated.
              data.opacity = {
                value: this.opacity?.value?.[0]?.[1],
                animated: false,
              };
            } else {
              // Round the animated values.
              data.opacity = {
                value: data.opacity.value.map((value) => {
                  return [value[0], round(value[1], 2)];
                }),
                animated: true,
              };
            }
          } else if (data.opacity.value) {
            // Round the value.
            data.opacity = {
              value: round(data.opacity.value, 2),
              animated: false,
            };
          }
        }

        return await super.update(data, ...rest);
      }
    }
);
