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

      /**
       * @inheritdoc
       */
      async update(data) {
        // If the last keyframe has been deleted,
        // mark the property as unanimated.
        if (
          "opacity" in data &&
          data.opacity.animated &&
          Array.isArray(data.opacity.value) &&
          data.opacity.value.length === 0
        ) {
          data.opacity = {
            value: this.opacity?.value?.[0]?.[1],
            animated: false,
          };
        }

        return super.update(data);
      }
    }
);
