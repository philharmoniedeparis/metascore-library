import { Mixin } from "mixwith";
import { merge, round } from "lodash";
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
              items: createIntegerField(),
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
        if ("translate" in data) {
          if (data.translate.animated && Array.isArray(data.translate.value)) {
            if (data.translate.value.length === 0) {
              // If the last keyframe has been deleted,
              // mark the property as unanimated.
              data.translate = {
                value: this.translate?.value?.[0]?.[1],
                animated: false,
              };
            } else {
              // Round the animated values.
              data.translate = {
                value: data.translate.value.map((value) => {
                  return [value[0], [round(value[1][0]), round(value[1][1])]];
                }),
                animated: true,
              };
            }
          } else if (data.translate.value) {
            // Round the values.
            data.translate = {
              value: [
                round(data.translate.value[0]),
                round(data.translate.value[1]),
              ],
              animated: false,
            };
          }
        }

        if ("scale" in data) {
          if (data.scale.animated && Array.isArray(data.scale.value)) {
            if (data.scale.value.length === 0) {
              // If the last keyframe has been deleted,
              // mark the property as unanimated.
              data.scale = {
                value: this.scale?.value?.[0]?.[1],
                animated: false,
              };
            } else {
              // Round the animated values.
              data.scale = {
                value: data.scale.value.map((value) => {
                  return [
                    value[0],
                    [round(value[1][0], 2), round(value[1][1], 2)],
                  ];
                }),
                animated: true,
              };
            }
          } else if (data.scale.value) {
            // Round the values.
            data.scale = {
              value: [
                round(data.scale.value[0], 2),
                round(data.scale.value[1], 2),
              ],
              animated: false,
            };
          }
        }

        if ("rotate" in data) {
          if (data.rotate.animated && Array.isArray(data.rotate.value)) {
            if (data.rotate.value.length === 0) {
              // If the last keyframe has been deleted,
              // mark the property as unanimated.
              data.rotate = {
                value: this.rotate?.value?.[0]?.[1],
                animated: false,
              };
            } else {
              // Round the animated values.
              data.rotate = {
                value: data.rotate.value.map((value) => {
                  return [value[0], round(value[1])];
                }),
                animated: true,
              };
            }
          } else if (data.rotate.value) {
            // Round the value.
            data.rotate = {
              value: round(data.rotate.value),
              animated: false,
            };
          }
        }

        return await super.update(data, ...rest);
      }
    }
);
