import { mix } from "mixwith.ts";
import { merge, round } from "lodash";
import { createStringField, createIntegerField, createColorField, createBooleanField, createArrayField, createNumberField } from "@core/utils/schema";
import { createBorderRadiusField,createAnimatedField } from "../utils/schema";
import { AbstractComponent } from ".";
import type { Data as AbstractData } from "@/core/models/AbstractModel";
import Backgroundable from "./mixins/Backgroundable";
import Timeable from "./mixins/Timeable";
import type { AnySchemaObject } from "ajv";

export type Data = AbstractData & {
  "border-width"?: number|null
  opacity?: { animated: false, value: number } | { animated: true, value: [number, number][] }
  position?: [number, number]|null
  dimension?: [number, number]|null
  translate?: { animated: false, value: [number, number] } | { animated: true, value: [number, [number, number]][] }
  scale?: { animated: false, value: [number, number] } | { animated: true, value: [number, [number, number]][] }
  rotate?: { animated: false, value: number } | { animated: true, value: [number, number][] }
  "start-time"?: number|null
  "end-time"?: number|null
}

/**
 * @abstract
 */
export default class EmbeddableComponent extends mix(AbstractComponent).with(Timeable, Backgroundable) {

  /**
   * @inheritdoc
   */
  static type = "EmbeddableComponent";

  static get $isBorderable() {
    return true;
  }

  static get $isHideable() {
    return true;
  }

  static get $isOpacitable() {
    return true;
  }

  static get $isPositionable() {
    return true;
  }

  static get $isResizable() {
    return true;
  }

  static get $isTransformable() {
    return true;
  }

  /**
   * @inheritdoc
   */
  static get schema(): AnySchemaObject {
    return merge(super.schema, {
      properties: {
        name: createStringField({
          title: "Name",
          description: "The component's name",
        }),
        "border-width": createIntegerField({
          title: "Border width",
          default: 0,
          minimum: 0,
        }),
        "border-color": createColorField({
          ajv: this.ajv,
          title: "Border color",
          default: null,
          nullable: true,
        }),
        "border-radius": createBorderRadiusField({
          ajv: this.ajv,
          title: "Border radius",
          default: null,
          nullable: true,
        }),
        hidden: createBooleanField({
          title: "Hidden",
          default: false,
        }),
        opacity: createAnimatedField({
          ajv: this.ajv,
          title: "Opacity",
          default: { animated: false, value: 1 },
          items: createNumberField({
            minimum: 0,
            maximum: 1,
          }),
        }),
        position: createArrayField({
          title: "Position",
          default: [0, 0],
          items: [createIntegerField(), createIntegerField()],
        }),
        dimension: createArrayField({
          title: "Dimension",
          default: [50, 50],
          items: [
            createIntegerField({
              minimum: 1,
            }),
            createIntegerField({
              minimum: 1,
            }),
          ],
        }),
        translate: createAnimatedField({
          ajv: this.ajv,
          title: "Translate",
          default: { animated: false, value: [0, 0] },
          items: createArrayField({
            items: [createIntegerField(), createIntegerField()],
          }),
        }),
        scale: createAnimatedField({
          ajv: this.ajv,
          title: "Scale",
          default: { animated: false, value: [1, 1] },
          items: createArrayField({
            items: [createNumberField(), createNumberField()],
          }),
        }),
        rotate: createAnimatedField({
          ajv: this.ajv,
          title: "Rotate",
          default: { animated: false, value: 0 },
          items: createIntegerField(),
        }),
      },
    });
  }

  async update(data: Data, validate = true) {
    if (data["border-width"]) {
      data["border-width"] = Math.round(data["border-width"]);
    }

    if (data.opacity) {
      if (data.opacity.animated) {
        if (data.opacity.value.length === 0) {
          // If the last keyframe has been deleted,
          // mark the property as unanimated.
          data.opacity.value = this.opacity?.value?.[0]?.[1];
        } else {
          // Round the animated values.
          data.opacity.value = data.opacity.value.map((value) => {
            return [value[0], round(value[1], 2)];
          });
        }
      } else if (data.opacity.value) {
        // Round the value.
        data.opacity = {
          value: round(data.opacity.value as number, 2),
          animated: false,
        };
      }
    }

    if (data.position) {
      data.position[0] = Math.round(data.position[0]);
      data.position[1] = Math.round(data.position[1]);
    }

    if (data.dimension) {
      data.dimension[0] = Math.round(data.dimension[0]);
      data.dimension[1] = Math.round(data.dimension[1]);
    }

    if (data["start-time"]) {
      data["start-time"] = round(data["start-time"], 2);
    }
    if (data["end-time"]) {
      data["end-time"] = round(data["end-time"], 2);
    }

    return await super.update(data, validate);
  }
}

