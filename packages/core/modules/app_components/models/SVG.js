import { v4 as uuid } from "uuid";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import {
  createUrlField,
  createNumberField,
  createEnumField,
  createStringField,
  createArrayField,
  createColorField,
} from "@metascore-library/core/utils/schema";

export class SVG extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static type = "SVG";

  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        src: createUrlField({
          ajv,
          title: "Source",
        }),
      },
      if: {
        $id: uuid(), // Used for Ajv caching.
        properties: {
          colors: createArrayField({
            items: createColorField({ ajv, nullable: false }),
            minItems: 2,
            maxItems: 2,
          }),
        },
        required: ["colors"],
      },
      then: {
        properties: {
          colors: createArrayField({
            title: "Colors",
            items: [
              createColorField({ ajv, nullable: false }),
              createColorField({ ajv, nullable: false }),
            ],
          }),
        },
      },
      else: {
        if: {
          $id: uuid(), // Used for Ajv caching.
          properties: {
            colors: createArrayField({
              items: createColorField({ ajv, nullable: false }),
              minItems: 1,
              maxItems: 1,
            }),
          },
          required: ["colors"],
        },
        then: {
          properties: {
            colors: createArrayField({
              title: "Colors",
              items: [createColorField({ ajv, nullable: false })],
            }),
          },
        },
        else: {
          properties: {
            stroke: createColorField({
              ajv,
              title: "Stroke",
              nullable: true,
            }),
            "stroke-width": createNumberField({
              ajv,
              title: "Stroke width",
              multipleOf: 1,
              minimum: 0,
              nullable: true,
            }),
            "stroke-dasharray": createEnumField({
              title: "Stroke dasharray",
              enum: [null, "2,2", "5,5", "5,2,2,2", "5,2,2,2,2,2"],
              nullable: true,
              default: null,
            }),
            fill: createColorField({
              ajv,
              title: "Fill",
              nullable: true,
            }),
          },
          if: {
            $id: uuid(), // Used for Ajv caching.
            properties: {
              markers: createArrayField({
                minItems: 1,
              }),
            },
          },
          then: {
            properties: {
              "marker-start": createStringField({
                title: "Marker start",
                nullable: true,
              }),
              "marker-mid": createStringField({
                title: "Marker mid",
                nullable: true,
              }),
              "marker-end": createStringField({
                title: "Marker end",
                nullable: true,
              }),
            },
          },
        },
      },
      required: ["src"],
    });
  }
}

export default SVG;
